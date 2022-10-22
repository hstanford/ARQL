import { parse } from '@arql/parser';
import { contextualise } from '@arql/contextualiser';
import { DataModel, TransformDef } from '@arql/models';
import { RankedOperator } from '@arql/operators';

export function runner({
  models,
  transforms,
  functions,
  opMap,
}: {
  models: Map<string, DataModel>;
  transforms: TransformDef[];
  functions: TransformDef[];
  opMap: Map<string, RankedOperator>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  return function (query: string, params: any[]) {
    const parsed = parse(query);
    const contextualised = contextualise(
      parsed,
      models,
      transforms,
      functions,
      opMap
    );
    return contextualised;
  };
}
