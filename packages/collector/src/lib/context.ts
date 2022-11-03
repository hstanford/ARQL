import {
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
} from '@arql/contextualiser';

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
  modifier: string[],
  origin: Row[] | Record<string, Records>,
  args: (record: Row | ResultMap) => Field[],
  constituentFields: ContextualisedField[],
  context: CollectorContext,
  argFields: (
    | number
    | ContextualisedParam
    | ContextualisedExpr
    | ContextualisedFunction
  )[],
  shape?: ContextualisedField[]
) => Records;

export type FunctionFn = (args: Field[]) => Field;
export type OperatorFn = (args: Field[]) => Field;

// expected configuration format for the collector
export interface CollectorConfig {
  transforms: Record<string, TransformFn>;
  functions: Record<string, (args: Field[]) => Field>;
  operators: Record<string, (args: Field[]) => Field>;
}

// the interface of a context object that is accessible
// everywhere in the collector
export interface CollectorContext extends CollectorConfig {
  params: unknown[];
}
