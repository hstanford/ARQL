import {
  combineRequirements,
  DataSource,
  Node,
  Requirements,
} from '@arql/models';
import { uniq } from '@arql/util';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { constituentFields } from './util';

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
  /** The name of the operation that makes up this expression */
  op: string;
  /** The arguments to this operation - can be sub-expressions, fields, parameters, or functions */
  args: (
    | ContextualisedExpr
    | ContextualisedField
    | ContextualisedParam
    | ContextualisedFunction
  )[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedExpr extends ContextualisedExprDef {}
export class ContextualisedExpr extends Node<ContextualisedExprDef> {
  type = 'exprtree' as const;
  propKeys = ['op', 'args'] as const;
  override _requirements: Requirements = {
    sources: [],
    flags: { supportsExpressions: true },
    functions: [],
    operations: [],
    transforms: [],
  };

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields(): ContextualisedField[] {
    // propagate required fields down to the arguments
    const fields: ContextualisedField[] = [];
    for (const arg of this.args) {
      fields.push(...constituentFields(arg));
    }
    return fields;
  }

  /**
   * "sources" list the data sources required to satisfy all the commitments
   * this expression has
   */
  get sources(): DataSource[] {
    return uniq(this.constituentFields.map((f) => f.sources).flat());
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      op: this.op,
      args: this.args.map((a) => a.def),
    };
  }

  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...this.args.map((a) => a.requirements)
    );
  }
}
