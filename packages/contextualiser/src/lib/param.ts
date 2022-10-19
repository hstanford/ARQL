import { combineRequirements, Node, Requirements } from '@arql/models';

/**
 * A parameter represents static data (e.g. strings, numbers, json)
 * typically from user inputs, which will be ultimately injected by
 * the data access adapters
 */
export interface ContextualisedParamDef {
  /** the index identifies which value this parameter represents */
  index: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedParam extends ContextualisedParamDef {}
export class ContextualisedParam extends Node<ContextualisedParamDef> {
  type = 'param' as const;
  propKeys = ['index'] as const;

  /**
   * def is a serialisation getter for testing
   */
  get def() {
    return {
      index: this.index,
    };
  }

  get requirements(): Requirements {
    return combineRequirements(this._requirements, {
      sources: [],
      flags: {
        supportsParameters: true,
      },
      functions: [],
      transforms: [],
      operations: [],
    });
  }
}
