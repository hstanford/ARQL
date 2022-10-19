import {
  combineRequirements,
  DataSource,
  Node,
  Requirements,
} from '@arql/models';
import { uniq } from '@arql/util';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { ContextualisedParam } from './param';
import { constituentFields } from './util';

/**
 * Transforms represent functions, which can operate over collections,
 * fields, params, and other functions
 */
export interface ContextualisedFunctionDef {
  name: string;
  modifier: string[];
  args: (
    | ContextualisedField
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
  )[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedFunction extends ContextualisedFunctionDef {}
export class ContextualisedFunction extends Node<ContextualisedFunctionDef> {
  type = 'contextualised_transform' as const;
  propKeys = ['name', 'modifier', 'args', 'sources'] as const;

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
      name: this.name,
      modifier: this.modifier,
      args: this.args.map((a) =>
        Array.isArray(a) ? a.map((subA) => subA.def) : a.def
      ),
    };
  }

  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...this.args.map((arg) => arg.requirements)
    );
  }
}
