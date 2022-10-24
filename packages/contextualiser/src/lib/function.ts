import {
  combineRequirements,
  Node,
  Requirements,
  TransformDef,
} from '@arql/models';
import { ContextualisedExpr } from './expr';
import { ContextualisedParam } from './param';
import { constituentFields, ContextualiserState, ID, isId } from './util';

/**
 * Functions can operate over collections,
 * fields, params, and other functions
 */
export interface ContextualisedFunctionDef {
  /** an object tracking the state of the ast the field is part of */
  context: ContextualiserState;

  /** the interface definition of the function that resolves this node */
  function: TransformDef;

  /** flags that change the behaviour of the function, e.g. "left" for a join */
  modifier: string[];

  /** arguments passed to the function */
  args: (
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
    | ID
  )[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedFunction extends ContextualisedFunctionDef {}

export class ContextualisedFunction extends Node<ContextualisedFunctionDef> {
  type = 'contextualised_function' as const;

  constructor(opts: ContextualisedFunctionDef) {
    super(opts);

    this.name = opts.function.name;
    this._requirements.functions.push(this.function);
  }

  /** the name of the function that resolves this node */
  name: string;

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields(): ID[] {
    // get constituent fields from the arguments
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

  /**
   * Requirements that this function and all its arguments
   * demand in order for it to be resolved by any particular source
   */
  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...this.args.map((arg) =>
        isId(arg) ? this.context.get(arg).requirements : arg.requirements
      )
    );
  }
}
