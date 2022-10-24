import { combineRequirements, Node, Requirements } from '@arql/models';
import { ContextualisedExpr } from './expr';
import { ContextualisedParam } from './param';
import { constituentFields, ContextualiserState, ID, isId } from './util';

/**
 * Functions can operate over collections,
 * fields, params, and other functions
 */
export interface ContextualisedFunctionDef {
  context: ContextualiserState;
  name: string;
  modifier: string[];
  args: (
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
    | ID
  )[];
  additionalRequirements?: Requirements;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedFunction extends ContextualisedFunctionDef {}
export class ContextualisedFunction extends Node<ContextualisedFunctionDef> {
  type = 'contextualised_function' as const;

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
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
      name: this.name,
      modifier: this.modifier,
      args: this.args.map((a) => (isId(a) ? a : a.def)),
    };
  }

  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...this.args.map((arg) =>
        isId(arg) ? this.context.get(arg).requirements : arg.requirements
      )
    );
  }
}
