import { combineRequirements, Node, Requirements } from '@arql/models';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { constituentFields, ContextualiserState, ID, isId } from './util';

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
