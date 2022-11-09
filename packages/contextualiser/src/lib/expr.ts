import { DataField } from '@arql/models';
import { Expr } from '@arql/parser';
import { ContextualisedField } from './field.js';
import { ContextualisedFunction, getFunction } from './function.js';
import { ID } from './id.js';
import { resolve } from './operators.js';
import { ContextualisedParam } from './param.js';
import { ContextualisedQuery, ContextualiserState } from './util.js';

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

export type ContextualisedFieldValue =
  | ID
  | DataField
  | ContextualisedParam
  | ContextualisedFunction;

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
): ContextualisedFieldValue {
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
      throw new Error(`Can't find subfield for ${expr.root}`);
    }

    return new ID({ id: field.id, dataType: field.dataType });
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
