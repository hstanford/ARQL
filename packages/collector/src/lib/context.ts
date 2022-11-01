import { ContextualisedField } from '@arql/contextualiser';

export type Field = unknown;
export type Result = Record<string, unknown>;
export type ResultMap = Map<string, Result>;
export type Results = Result[];
export interface CollectorConfig {
  transforms: Record<
    string,
    (
      modifier: string[],
      origin: Results | Record<string, Results | ResultMap[]>,
      args: (record: Result | ResultMap) => Field[],
      constituentFields: ContextualisedField[],
      context: CollectorContext,
      shape?: ContextualisedField[]
    ) => Results | ResultMap[]
  >;
  functions: Record<string, (args: Field[]) => Field>;
  operators: Record<string, (args: Field[]) => Field>;
}
export interface CollectorContext extends CollectorConfig {
  params: unknown[];
}
