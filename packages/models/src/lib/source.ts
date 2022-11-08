/**
 * A data source needs:
 * - to know what models it has and what fields those models have
 * - to know what operations and transforms it supports and how to perform them
 * - how to resolve a query tree
 */

import { FunctionDef, TransformDef } from '@arql/types';
import { Dictionary } from '@arql/util';
import { Flags } from './flags';
import { DataModel } from './model';
import { Requirements } from './requirements';
import { operatorOp, SourceConfig, transformFn } from './util';

export abstract class DataSource extends Flags {
  models: DataModel[];
  operators: Record<string, operatorOp>;
  transforms: Record<string, transformFn>;
  functions: Record<string, transformFn>;

  constructor(config: SourceConfig) {
    super();
    this.models = config.models.map((m) => new DataModel(m, this));
    this.operators = config.operators;
    this.transforms = config.transforms;
    this.functions = config.functions;
  }

  // this method should get data from the source
  abstract resolve(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subquery: any, // should be ContextualisedQuery,
    params: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Dictionary[]>;

  async init() {
    return;
  }

  implementsOp(opName: string) {
    return this.operators[opName];
  }

  implementsTransform(transform: TransformDef) {
    return this.transforms[transform.name]; // TODO: make it check modifiers and args
  }

  implementsFunction(fn: FunctionDef) {
    return this.functions[fn.name]; // TODO: make it check modifiers and args
  }

  // assert that this source satisfies a particular set of requirements
  satisfies(requirements: Requirements): boolean {
    const satisfiesSources =
      requirements.sources.length === 1 && requirements.sources.includes(this);

    const satisfiesFlags = (
      Object.entries(requirements.flags) as [keyof Flags, true][]
    ).every(([k, v]) => {
      if (typeof this[k] === 'boolean') {
        return v && this[k];
      } else if (typeof this[k] === 'number') {
        return v <= this[k];
      } else {
        return false;
      }
    });

    const satisfiesFunctions = requirements.functions.every((f) =>
      this.implementsFunction(f)
    );

    const satisfiesTransform = requirements.transforms.every((f) =>
      this.implementsTransform(f)
    );

    const satisfiesOperations = requirements.operations.every(
      (opName) => !!this.operators[opName]
    );

    return (
      satisfiesSources &&
      satisfiesFlags &&
      satisfiesFunctions &&
      satisfiesTransform &&
      satisfiesOperations
    );
  }

  /** serialisation getter for testing */
  get def() {
    return {
      models: this.models.map((m) => m.def),
    };
  }
}
