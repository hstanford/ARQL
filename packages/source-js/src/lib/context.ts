import {
  ContextualisedField,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModelDef } from '@arql/models';
import { FunctionSignature, TypeForTs } from '@arql/types';

// an individual data value
export type Field = unknown;

// a {key: value} store of data
export type Row = Record<string, Field>;

// a multi-row object, the data resolution of a multi-collection in @arql/contextualiser
export type ResultMap = Map<string, Row>;
export function isResultMaps(items: Row[] | ResultMap[]): items is ResultMap[] {
  return items[0] instanceof Map;
}

// general exposed data type
export type Records = Row[] | ResultMap[];

export type TransformFn = (
  transform: ContextualisedTransform,
  origin: Row[] | Record<string, Records>,
  constituentFields: ContextualisedField[],
  context: SourceContext
) => Records;

export type FunctionFn<T extends FunctionSignature | unknown = unknown> = (
  args: T extends FunctionSignature ? TypeForTs<T['args']> : unknown[],
  modifier: string[]
) => T extends FunctionSignature ? TypeForTs<T['return']> : unknown;

export interface SourceConfig {
  transforms: Record<string, TransformFn>;
  functions: Record<string, FunctionFn>;
  data: Map<string, Row[]>;
}

export interface SourceContext extends SourceConfig {
  models: Record<string, DataModelDef>;
  params: unknown[];
}
