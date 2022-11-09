import { ContextualisedField } from '@arql/contextualiser';
import { DelegatedTransform } from '@arql/delegator';
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
  transform: DelegatedTransform,
  origin: Row[] | Record<string, Records>,
  constituentFields: ContextualisedField[],
  context: CollectorContext
) => Records;

export type FunctionFn<T extends FunctionSignature | unknown = unknown> = (
  args: T extends FunctionSignature ? TypeForTs<T['args']> : unknown[],
  modifier: string[]
) => T extends FunctionSignature ? TypeForTs<T['return']> : unknown;

// expected configuration format for the collector
export interface CollectorConfig {
  transforms: Record<string, TransformFn>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functions: Record<string, FunctionFn>;
}

// the interface of a context object that is accessible
// everywhere in the collector
export interface CollectorContext extends CollectorConfig {
  params: unknown[];
}
