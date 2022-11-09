import { combineRequirements, Node, Requirements } from '@arql/models';
import { Transform } from '@arql/parser';
import { FunctionDef, tuple, Type } from '@arql/types';
import { ContextualisedCollection } from './collection';
import { ContextualisedFieldValue, getExpression } from './expr';
import { ContextualisedTransform } from './transform';
import {
  constituentFields,
  ContextualisedQuery,
  ContextualiserState,
  ID,
  isId,
} from './util';

/**
 * Functions can operate over collections,
 * fields, params, and other functions
 */
export interface ContextualisedFunctionDef {
  /** an object tracking the state of the ast the field is part of */
  context: ContextualiserState;

  /** the interface definition of the function that resolves this node */
  function: FunctionDef;

  /** flags that change the behaviour of the function, e.g. "left" for a join */
  modifier: string[];

  /** arguments passed to the function */
  args: ContextualisedFieldValue[];

  /** the data type for the collector */
  dataType: Type;

  /** the data type for the source */
  sourceDataType?: string;
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

/**
 * Contextualises an inline function
 * @param func a transform object from @arql/parser
 * @param model the collection(s) that this function acts within
 * @param context contains which models/collections are available at this level of the query
 * @returns a contextualised function node
 */
export function getFunction(
  func: Transform,
  model: ContextualisedQuery | ContextualisedQuery[],
  context: ContextualiserState
): ContextualisedFunction {
  const args = func.args.map((arg) => {
    if (!Array.isArray(arg) && arg.type === 'shape') {
      throw new Error('Cannot pass shape to inline function');
    }
    return getExpression(arg, model, context);
  });

  const { match, fnSignature } = findMatchingFunction(
    func.description.root,
    args,
    context
  );

  return new ContextualisedFunction({
    context,
    function: match,
    modifier: func.description.parts.filter(
      (part) => match.modifiers && match.modifiers.indexOf(part) !== -1
    ),
    args,
    dataType: fnSignature.return.resolve(),
  });
}

/**
 *
 * @param name function name to find
 * @param args arguments to provide to the function
 * @param context contains which models/collections are available at this level of the query
 * @returns the matched function and its signature (separate because generic params have been given context)
 */
export function findMatchingFunction(
  name: string,
  args: ContextualisedFieldValue[],
  context: ContextualiserState
) {
  const match = context.functions.find((f) => f.name === name);
  if (!match) throw new Error(`Unrecognised function ${name}`);

  const fnSignature =
    typeof match.signature === 'function'
      ? match.signature({})
      : match.signature;

  const argTypes = args.map((arg) => {
    if (isId(arg)) {
      const underlyingField = context.get(arg);
      if (
        underlyingField instanceof ContextualisedCollection ||
        underlyingField instanceof ContextualisedTransform
      ) {
        throw new Error('Cannot get data type for collection');
      }
      return underlyingField.dataType;
    } else {
      return arg.dataType;
    }
  });

  const compatible = fnSignature.args.satisfiedBy(tuple(...argTypes));

  if (!compatible) {
    throw new Error('Arguments were not compatible with function signature');
  }

  return { match, fnSignature };
}
