import { DataModel, TransformDef } from '@arql/models';
import { ExprTree, resolver } from '@arql/operators';
import {
  getAlias,
  Alphachain,
  Transform,
  Collection,
  Query,
  Field,
  Expr,
  BaseExpr,
} from '@arql/parser';
import { uniq } from '@arql/util';
import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';
import {
  ContextualisedQuery,
  ContextualiserConfig,
  ContextualiserState,
  ID,
  selectField,
} from './util';

/**
 * CONTEXTUALISER
 *
 * The Contextualiser's role is to take an AST (Abstract Syntax Tree) returned from the Parser
 * and to add knowledge of what data can be provided. It depends on the AST structure and on
 * the models configured. If the models are stored in different storage engines or databases
 * the contextualiser bubbles up which data sources will be required to resolve data at each level.
 */
export class Contextualiser {
  models: Map<string, DataModel>;
  transforms: TransformDef[];
  functions: TransformDef[];
  resolveExpr: ReturnType<typeof resolver>;
  constructor(config: ContextualiserConfig) {
    this.models = config.models;
    this.transforms = config.transforms;
    this.functions = config.functions;
    this.resolveExpr = resolver(config.opMap);
  }

  /**
   * Orchestrates the contextualisation of a query tree from @arql/parser
   * @param ast the parsed input query tree
   * @returns a contextualised query tree
   */
  run(ast: Query) {
    if (!ast.value) {
      throw new Error('Can only contextualise collections');
    }

    const context = new ContextualiserState();

    const collection = this.handleCollection(ast.value, context);

    // propagate field requirements down through the tree.
    // if no external interface has been specified for the top-level collection,
    // assume an implicit wildcard and require all available fields
    if (!collection.shape?.length) {
      collection.applyRequiredFields(collection.availableFields);
    } else {
      collection.applyRequiredFields(collection.shape);
    }

    return collection;
  }

  /**
   * Contextualises a collection
   * @param collection a collection from @arql/parser
   * @param context contains which models/collections are available at this level of the query
   * @returns a contextualised collection
   */
  handleCollection(
    collection: Collection,
    context: ContextualiserState
  ): ContextualisedQuery {
    let value: ContextualisedQuery | ContextualisedQuery[];

    // recursively handle collection values, so the tree is contextualised
    // from the leaves upwards
    if (Array.isArray(collection.value)) {
      value = collection.value.map((s) => this.handleCollection(s, context));
    } else if (collection.value?.type === 'collection') {
      value = this.handleCollection(collection.value, context);
    } else if (collection.value?.type === 'alphachain') {
      const model = this.getModel(collection.value, context);
      if (!model) {
        throw new Error(`Could not find model ${getAlias(collection.value)}`);
      }

      value = new ContextualisedCollection({
        context,
        origin: model,
        name: collection.alias ?? model.name,
      });
    } else {
      throw new Error(`Could not handle ${collection.value}`);
    }

    // make the collection's constituent collections available to
    // retrieve fields from
    for (const coll of [value].flat()) {
      if (coll.name) {
        context.aliases.set(coll.name, coll);
      }
    }

    // apply transformations to the collection
    if (collection.transforms.length) {
      for (const transform of collection.transforms) {
        value = this.getTransform(transform, value, context);
      }
    }

    if (Array.isArray(value)) {
      throw new Error('Cannot handle an untransformed multi-collection');
    }

    // Narrowed to single collection
    let out: ContextualisedQuery = value;

    // Apply the shape
    if (collection.shape) {
      if (Array.isArray(collection.shape)) {
        throw new Error('Multi-shapes are not currently supported');
      }
      out.shape = uniq(
        collection.shape.fields
          .map((field) =>
            field.type === 'wildcard'
              ? out.availableFields.map((f) => selectField(f, out, context))
              : this.getField(field, out, context)
          )
          .flat()
      );
      out._requirements.flags.supportsShaping = true;
    }

    // alias the collection if needed
    if (collection.alias) {
      out = new ContextualisedCollection({
        context,
        name: collection.alias,
        origin: value,
      });
      context.aliases.set(collection.alias, value);
    }

    return out;
  }

  /**
   * Retrieves a model or collection
   * @param alphachain an object describing the model the query wants
   * @param context contains which models/collections are available at this level of the query
   * @returns a collection or data model
   */
  getModel(alphachain: Alphachain, context: ContextualiserState) {
    let model: ContextualisedQuery | DataModel | undefined;
    if (context.aliases.has(alphachain.root)) {
      // it's the name of a collection in scope
      model = context.aliases.get(alphachain.root);
    } else if (this.models.has(alphachain.root)) {
      // it's the name of a datamodel
      model = this.models.get(alphachain.root);
    }

    if (!model) {
      throw new Error(`Failed to find model ${JSON.stringify(alphachain)}`);
    }

    // DataModels need wrapping in a collection otherwise
    // it becomes tricky to apply a complex shape directly
    if (model instanceof DataModel) {
      return new ContextualisedCollection({
        context,
        origin: model,
        name: model.name,
      });
    }

    return model;
  }

  /**
   * Contextualises a transform
   * @param transform a transform object from @arql/parser
   * @param model the collection(s) that this transform acts on
   * @param context contains which models/collections are available at this level of the query
   * @returns a contextualised transform node
   */
  getTransform(
    transform: Transform,
    model: ContextualisedQuery | ContextualisedQuery[],
    context: ContextualiserState
  ): ContextualisedTransform {
    const match = this.transforms.find(
      (tr) => tr.name === transform.description.root
    );
    if (!match)
      throw new Error(`Unrecognised transform ${transform.description.root}`);

    const contextualisedTransform = new ContextualisedTransform({
      context,
      transform: match,
      modifier: transform.description.parts.filter(
        (part) => match.modifiers && match.modifiers.includes(part)
      ),
      args: [],
      origin: model,
    });

    // handle transform arguments
    for (const arg of transform.args) {
      if (!Array.isArray(arg) && arg.type === 'shape') {
        // the last shape mentioned as a transform argument
        // becomes the external interface of the transform
        contextualisedTransform.shape = arg.fields
          .map((f) =>
            f.type === 'wildcard'
              ? [model]
                  .flat()
                  .map((m) =>
                    m.availableFields.map((f) =>
                      selectField(f, contextualisedTransform, context)
                    )
                  )
                  .flat()
              : this.getField(f, contextualisedTransform, context)
          )
          .flat();
        contextualisedTransform._requirements.flags.supportsShaping = true;
        continue;
      }
      if (!Array.isArray(arg) && arg.type === 'collection') {
        throw new Error('Collection as transform arg not supported');
      }
      contextualisedTransform.args.push(
        this.getExpression(arg, model, context)
      );
    }

    return contextualisedTransform;
  }

  /**
   * Contextualises an inline function
   * @param func a transform object from @arql/parser
   * @param model the collection(s) that this function acts within
   * @param context contains which models/collections are available at this level of the query
   * @returns a contextualised function node
   */
  getFunction(
    func: Transform,
    model: ContextualisedQuery | ContextualisedQuery[],
    context: ContextualiserState
  ): ContextualisedFunction {
    const match = this.functions.find((f) => f.name === func.description.root);
    if (!match)
      throw new Error(`Unrecognised function ${func.description.root}`);

    const contextualisedFunction = new ContextualisedFunction({
      context,
      function: match,
      modifier: func.description.parts.filter(
        (part) => match.modifiers && match.modifiers.indexOf(part) !== -1
      ),
      args: [],
    });

    contextualisedFunction.args = func.args.map((arg) => {
      if (!Array.isArray(arg) && arg.type === 'shape') {
        throw new Error('Cannot pass shape to inline function');
      }
      return this.getExpression(arg, model, context);
    });

    return contextualisedFunction;
  }

  /**
   * Contextualises a field
   * @param field an object describing the field the query wants
   * @param model the collection we're acting within
   * @param context contains which models/collections are available at this level of the query
   * @returns a contextualised field
   */
  getField(
    field: Field,
    model: ContextualisedQuery,
    context: ContextualiserState
  ): ContextualisedField {
    let contextualisedField: ContextualisedField;

    if (model.origin instanceof DataModel) {
      // if the field comes directly from a datamodel
      // only the raw fields should be exposed
      const dataField = model.origin.fields.find((f) => f.name === field.alias);
      if (!dataField) {
        throw new Error(`Could not find ${JSON.stringify(field)}`);
      }

      contextualisedField = selectField(dataField, model, context);
    } else {
      contextualisedField = new ContextualisedField({
        context,
        name: field.alias || '',
        field: this.getExpression(field.value, model.origin, context),
        origin: model,
      });
      context.items.push(contextualisedField);
      if (field.alias) {
        model._requirements.flags.supportsFieldAliasing = true;
      }
    }

    return contextualisedField;
  }

  /**
   * Contextualises an expression
   * @param expr an expression from @arql/parser
   * @param model the collection(s) we're acting within
   * @param context contains which models/collections are available at this level of the query
   * @returns a contextualised field, expression, parameter or function
   */
  getExpression(
    ipt: Expr | ExprTree,
    model: ContextualisedQuery | ContextualisedQuery[],
    context: ContextualiserState,
    nested?: boolean
  ): ID | ContextualisedExpr | ContextualisedParam | ContextualisedFunction {
    const expr: BaseExpr | ExprTree = Array.isArray(ipt)
      ? this.resolveExpr(ipt)
      : ipt;
    if (expr.type === 'alphachain') {
      // a simple foo.bar should resolve to a plain field
      // accessed from the available fields of the collection
      let field: ContextualisedField | undefined;
      for (const baseModel of [model].flat()) {
        const part = expr.root;
        const fields = baseModel.availableFields;
        field = fields.find((f) => f.name === part);
        if (field) break;
      }
      if (!field) {
        throw new Error(`Can't find subfield for ${expr.root}`);
      }

      return field.id;
    } else if (expr.type === 'exprtree') {
      // a more complex expression should be resolved recursively
      const args = expr.args.map((arg) =>
        this.getExpression(arg, model, context, true)
      );
      const contExpr = new ContextualisedExpr({
        ...expr,
        args,
        context,
      });
      contExpr._requirements.operations.push(expr.op);
      // if an expr is nested we need to set the flag
      if (nested) {
        contExpr._requirements.flags.supportsSubExpressions = true;
      }
      return contExpr;
    } else if (expr.type === 'param') {
      return new ContextualisedParam({ index: expr.index });
    } else if (expr.type === 'function') {
      if (expr.name.type !== 'alphachain') {
        // no support for something that looks like (a + b)(x)
        throw new Error('Unhandled function call on complex sub-expression');
      }
      return this.getFunction(
        { type: 'transform', description: expr.name, args: expr.args },
        model,
        context
      );
    } else {
      throw new Error(`Invalid expression type ${expr.type}`);
    }
  }
}

// helper wrapper around Contextualiser.prototype.run as a default entry point
export function contextualise(ast: Query, config: ContextualiserConfig) {
  return new Contextualiser(config).run(ast);
}
