import { Dictionary, PickByNotValue, uniq } from '@arql/util';

export abstract class Node<T> {
  abstract propKeys: readonly (keyof this)[];
  parentKey: keyof this | undefined = undefined;
  _requirements: Requirements = {
    sources: [],
    flags: {},
    functions: [],
    transforms: [],
    operations: [],
  };
  abstract get requirements(): Requirements;
  constructor(opts?: T) {
    opts && Object.assign(this, opts);
  }

  clone(override?: Partial<T>) {
    const Cls = this.constructor as new (
      opts: Partial<T>,
      parent: unknown
    ) => this;
    const opts = (this.propKeys as (keyof T)[]).reduce(
      (agg: Partial<T>, key: keyof T) =>
        Object.assign(agg, {
          [key]: (this as { [K in keyof T]: unknown })[key],
        }),
      {} as Partial<T>
    ) as Partial<T>;
    const newInstance = new Cls(
      opts,
      this.parentKey ? this[this.parentKey] : undefined
    );
    if (override) Object.assign(newInstance, override);
    return newInstance;
  }
}

// TODO: can these be typed more narrowly?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type operatorOp = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type transformFn = (...args: any[]) => any;

/**
 * "TransformDef" is a data structure that details the call signature of
 * a transformation function
 */
export interface TransformDef {
  type: 'transformdef';
  name: string;
  modifiers?: string[];
  nArgs: string | number;
}

export interface Requirements {
  sources: DataSource[];
  flags: Partial<Flags>;
  functions: TransformDef[];
  transforms: TransformDef[];
  operations: string[];
}

function combineFlags(...flags: Partial<Flags>[]) {
  const outFlags: Partial<Flags> = {};
  for (const flagSet of flags) {
    for (const key in flagSet) {
      const castKey = key as keyof Flags;
      const val = flagSet[castKey];
      if (typeof val === 'boolean') {
        // TODO: find a nice way of doing this without "any" casts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outFlags[castKey] = !!(flagSet[castKey] || outFlags[castKey]) as any;
      } else if (typeof val === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outFlags[castKey] = (val + ((outFlags[castKey] as number) ?? 0)) as any;
      } else {
        throw new Error(`Unexpected flag value ${typeof val}`);
      }
    }
  }
  return outFlags;
}

export function combineRequirements(...requirements: Requirements[]) {
  const baseRequirement: Requirements = {
    sources: [],
    flags: {},
    functions: [],
    transforms: [],
    operations: [],
  };
  for (const requirement of requirements) {
    baseRequirement.sources = uniq(
      baseRequirement.sources.concat(requirement.sources)
    );
    baseRequirement.flags = combineFlags(
      baseRequirement.flags,
      requirement.flags
    );
    baseRequirement.functions = uniq(
      baseRequirement.functions.concat(requirement.functions)
    );
    baseRequirement.transforms = uniq(
      baseRequirement.transforms.concat(requirement.transforms)
    );
    baseRequirement.operations = uniq(
      baseRequirement.operations.concat(requirement.operations)
    );
  }
  return baseRequirement;
}

export abstract class Flags {
  // these will be used by the contextualiser/delegator to work out if
  // we need to reject the query or where to break the node off the tree
  // as a delegated query we can definitely resolve
  abstract supportsExpressions: boolean;
  abstract supportsSubExpressions: boolean;

  // the maximum depth of nested collections that the source can query.
  // "1" implies that the query tree handed off to the delegator must
  // have at most one contextualised query.
  // "undefined" indicates no limit to the depth
  abstract subCollectionDepth: number;

  abstract supportsShaping: boolean;
  abstract supportsFieldAliasing: boolean;
  abstract supportsExpressionFields: boolean;
  abstract supportsGraphFields: boolean; // like users {orders {name}}
  abstract supportsRecursiveJoins: boolean;
  abstract supportsStaticDataInjection: boolean; // like VALUES
  abstract supportsQueryNarrowing: boolean; // id IN (...) type operations
  abstract supportsSubscriptions: boolean;
  abstract supportsParameters: boolean;
}

/**
 * A data source needs:
 * - to know what models it has and what fields those models have
 * - to know what operations and transforms it supports and how to perform them
 * - how to resolve a query tree
 */

export abstract class DataSource extends Flags {
  models: DataModel[];
  operators: Record<string, operatorOp>;
  transforms: Record<string, transformFn>;

  constructor(
    models: DataModelDef[],
    operators: Record<string, operatorOp>,
    transforms: Record<string, transformFn>
  ) {
    super();
    this.models = models.map((m) => new DataModel(m, this));
    this.operators = operators;
    this.transforms = transforms;
  }

  getField(modelName: string, fieldName: string, ...parts: string[]) {
    const field = this.models
      .find((m) => m.name === modelName)
      ?.fields.find((f) => f.name === fieldName);
    if (parts?.length) {
      throw new Error('Subfield parts not supported yet');
    }
    return field;
  }

  abstract resolve(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subquery: any, // should be ContextualisedCollection,
    data: Dictionary[] | null,
    results: Dictionary[][],
    params: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Dictionary[] | Dictionary>;

  implementsOp(opName: string) {
    return this.operators[opName];
  }

  implementsTransform(transform: TransformDef) {
    return this.transforms[transform.name]; // TODO: make it check modifiers and args
  }

  satisfies(requirements: Requirements) {
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
      this.implementsTransform(f)
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

  get def() {
    return {
      models: this.models.map((m) => m.def),
    };
  }
}

export interface DataFieldDef {
  name: string;
  datatype: dataType;
  fields?: DataFieldDef[];
}
export interface DataField extends DataFieldDef {
  model: DataModel;
  fields?: DataField[];
}
export class DataField extends Node<DataFieldDef> {
  type = 'datafield' as const;
  propKeys = ['name', 'datatype', 'fields', 'model'] as const;
  override parentKey = 'model' as const;
  constructor(opts: DataFieldDef, model: DataModel) {
    super();
    this.name = opts.name;
    this.datatype = opts.datatype;
    this.fields = (opts.fields || []).map((f) => new DataField(f, model));
    this.model = model;
  }
  get def(): DataFieldDef {
    return {
      name: this.name,
      datatype: this.datatype,
      //fields: this.fields?.map((f) => f.def),
    };
  }
  get requirements(): Requirements {
    return {
      sources: [this.model.source],
      flags: {},
      functions: [],
      transforms: [],
      operations: [],
    };
  }
}
export interface DataModelDef {
  name: string;
  fields: DataFieldDef[];
}
export interface DataModel extends DataModelDef {
  source: DataSource;
  fields: DataField[];
}
export class DataModel extends Node<DataModelDef> {
  type = 'datamodel' as const;
  propKeys = ['name', 'source', 'fields'] as const;
  override parentKey = 'source' as const;
  constructor(opts: DataModelDef, source: DataSource) {
    super();
    this.name = opts.name;
    this.fields = opts.fields.map((f) => new DataField(f, this));
    this.source = source;
  }
  get availableFields(): DataField[] {
    return Object.values(this.fields);
  }
  get requiredFields(): DataField[] {
    // a Data model doesn't put any requirements out
    return [];
  }
  get def(): DataModelDef {
    return {
      name: this.name,
      fields: this.fields.map((f) => f.def),
    };
  }
  get requirements(): Requirements {
    return {
      sources: [this.source],
      flags: {},
      functions: [],
      transforms: [],
      operations: [],
    };
  }
}

export type dataType = 'string' | 'number' | 'boolean' | 'json' | 'date';

/**
 * TYPE INFERENCE
 */

export type ModelsDeclaration = {
  [key: string]: DataModel;
};

export type DataTypes = {
  number: number;
  string: string;
  boolean: boolean;
  json: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  date: Date;
};

export type DataTypeDef<
  M extends ModelsDeclaration,
  T extends keyof M,
  U extends M[T],
  V extends keyof U['fields']
> = U['fields'][V] extends DataField ? U['fields'][V]['datatype'] : never;

export type TypeFor<
  M extends ModelsDeclaration,
  T extends keyof M,
  U extends keyof M[T]['fields']
> = DataTypes[DataTypeDef<M, T, M[T], U>];

export type ModelType<
  M extends ModelsDeclaration,
  T extends keyof M
> = PickByNotValue<
  {
    [U in keyof M[T]['fields']]: TypeFor<M, T, U>;
  },
  never
>;

export type ModelsDeclarationTypes<M extends ModelsDeclaration> = {
  [T in keyof M]: ModelType<M, T>;
};
