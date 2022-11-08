import { combineRequirements, Node, Requirements } from '@arql/models';
import { Expr } from '@arql/parser';
import { Type } from '@arql/types';
import { ContextualisedField } from './field';
import { ContextualisedFunction, getFunction } from './function';
import { resolve } from './operators';
import { ContextualisedParam } from './param';
import {
  constituentFields,
  ContextualisedQuery,
  ContextualiserState,
  ID,
  isId,
} from './util';

/**
 * An expression is a tree-like representation of a mathematical expression
 * e.g. `a + (b - 4)` =>
 * {
 *   op: 'equals',
 *   args: [
 *     a,
 *     {
 *       op: 'minus',
 *       args: [b, 4]
 *     }
 *   ]
 * }
 *
 * TODO: consolidate with ContextualisedFunction?
 * `a + b` === `add(a, b)`
 */
export interface ContextualisedExprDef {
  /** an object tracking the state of the ast the expression is part of */
  context: ContextualiserState;

  /** The name of the operation that resolves this expression */
  op: string;

  /** The arguments to this operation - can be sub-expressions, fields, parameters, or functions */
  args: (
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
    | ID
  )[];

  /** the data type for the collector */
  dataType: Type;

  /** the data type for the source */
  sourceDataType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedExpr extends ContextualisedExprDef {}

export class ContextualisedExpr extends Node<ContextualisedExprDef> {
  type = 'contextualised_expr' as const;

  /**
   * Requirements that this expression (but not its arguments) demands
   * in order for it to be resolved by any particular source
   */
  override _requirements: Requirements = {
    sources: [],
    flags: {
      supportsExpressions: true,
    },
    functions: [],
    operations: [],
    transforms: [],
  };

  /**
   * lists all the core data fields that originate elsewhere
   */
  get constituentFields(): ID[] {
    // propagate required fields down to the arguments
    const fields: ID[] = [];
    for (const arg of this.args) {
      fields.push(...constituentFields(arg));
    }
    return fields;
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      op: this.op,
      args: this.args.map((a) => (isId(a) ? a : a.def)),
    };
  }

  /**
   * Requirements that this expression and all its arguments
   * demand in order for it to be resolved by any particular source
   */
  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...this.args.map((a) =>
        isId(a) ? this.context.get(a).requirements : a.requirements
      )
    );
  }
}

/**
 * Contextualises an expression
 * @param expr an expression from @arql/parser
 * @param model the collection(s) we're acting within
 * @param context contains which models/collections are available at this level of the query
 * @returns a contextualised field, expression, parameter or function
 */
export function getExpression(
  expr: Expr,
  model: ContextualisedQuery | ContextualisedQuery[],
  context: ContextualiserState
): ID | ContextualisedExpr | ContextualisedParam | ContextualisedFunction {
  if (Array.isArray(expr)) {
    return resolve(expr, model, context);
  }
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

    // allow referring to the model by the first part of the alphachain
    if (!field) {
      for (const baseModel of [model].flat()) {
        if (baseModel.name !== expr.root) {
          continue;
        }
        const part = expr.parts[0];
        const fields = baseModel.availableFields;
        field = fields.find((f) => f.name === part);
        if (field) break;
      }
    }

    if (!field) {
      console.log(
        [model].flat().map((m) => m.availableFields),
        expr
      );
      throw new Error(`Can't find subfield for ${expr.root}`);
    }

    return field.id;
  } else if (expr.type === 'param') {
    return new ContextualisedParam({ index: expr.index });
  } else if (expr.type === 'function') {
    if (expr.name.type !== 'alphachain') {
      // no support for something that looks like (a + b)(x)
      throw new Error('Unhandled function call on complex sub-expression');
    }
    return getFunction(
      { type: 'transform', description: expr.name, args: expr.args },
      model,
      context
    );
  } else {
    throw new Error(`Invalid expression type ${expr.type}`);
  }
}
