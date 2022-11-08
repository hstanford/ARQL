import { DataModel } from '@arql/models';
import { Query } from '@arql/parser';
import { FunctionDef, RankedOperator, TransformDef } from '@arql/types';
import { handleCollection } from './collection';
import { ContextualiserConfig, ContextualiserState } from './util';

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
  functions: FunctionDef[];
  opMap: Map<string, RankedOperator>;
  constructor(config: ContextualiserConfig) {
    this.models = config.models;
    this.transforms = config.transforms;
    this.functions = config.functions;
    this.opMap = config.opMap;
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

    const context = new ContextualiserState({
      models: this.models,
      transforms: this.transforms,
      functions: this.functions,
      opMap: this.opMap,
    });

    const collection = handleCollection(ast.value, context);

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
}

// helper wrapper around Contextualiser.prototype.run as a default entry point
export function contextualise(ast: Query, config: ContextualiserConfig) {
  return new Contextualiser(config).run(ast);
}
