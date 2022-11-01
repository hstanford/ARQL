import { parse } from '@arql/parser';
import { contextualise } from '@arql/contextualiser';
import { DataModel, TransformDef } from '@arql/models';
import { RankedOperator } from '@arql/operators';
import { delegate } from '@arql/delegator';
import { collector, CollectorConfig } from '@arql/collector';

export function runner({
  models,
  transforms,
  functions,
  opMap,
  collectorConfig,
}: {
  models: Map<string, DataModel>;
  transforms: TransformDef[];
  functions: TransformDef[];
  opMap: Map<string, RankedOperator>;
  collectorConfig: CollectorConfig;
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
    const delegatorOutput = delegate(contextualised);
    const collected = collector(delegatorOutput, {
      ...collectorConfig,
      params,
    });
    return collected;
  };
}
