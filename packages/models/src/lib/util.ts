import { DataModel, DataModelDef } from './model';

// expected input interface to configure a source
export interface SourceConfig {
  models: DataModelDef[];
  transforms: Record<string, transformFn>;
  functions: Record<string, transformFn>;
}

// TODO: can these be typed more narrowly?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type operatorOp = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type transformFn = (...args: any[]) => any;

/**
 * TYPE INFERENCE
 */

export type ModelsDeclaration = {
  [key: string]: DataModel;
};
/*
// A "map" type to look up the typescript type from any valid datatype
export type DataTypes = {
  number: number;
  string: string;
  boolean: boolean;
  json: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  date: Date;
};

// given a set of models, the model name, and a field name
// return the corresponding string datatype value
export type DataTypeDef<
  M extends ModelsDeclaration,
  T extends keyof M,
  U extends keyof M[T]['fields']
> = M[T]['fields'][U] extends DataField ? M[T]['fields'][U]['dataType'] : never;

// given a set of models, the model name, and a field name
// return the corresponding typescript type for that field
export type TypeFor<
  M extends ModelsDeclaration,
  T extends keyof M,
  U extends keyof M[T]['fields']
> = DataTypes[DataTypeDef<M, T, U>];

// given a set of models and the name of a model
// return a type that corresponds to the type of any
// record expected to originate from that model
export type ModelType<
  M extends ModelsDeclaration,
  T extends keyof M
> = PickByNotValue<
  {
    [U in keyof M[T]['fields']]: TypeFor<M, T, U>;
  },
  never
>;

// full types for any given models declaration
export type ModelsDeclarationTypes<M extends ModelsDeclaration> = {
  [T in keyof M]: ModelType<M, T>;
};

// the record type for a particular model definition
export type ModelDefType<M extends DataModelDef> = {
  [F in M['fields'][number] as F['name']]: DataTypes[F['datatype']];
};
*/
