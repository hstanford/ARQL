import { runner } from '@arql/core';
import { collectorConfig } from '@arql/stdlib-collector';
import { transforms, functions, opMap } from '@arql/stdlib-definitions';
import { sources, models } from './sources';

const run = runner({
  contextualiserConfig: {
    models: new Map(models.map((m) => [m.name, m])),
    transforms,
    functions,
    opMap,
  },
  collectorConfig: collectorConfig,
});

export async function test(query: string, params: unknown[]) {
  for (const source of sources) {
    await source.init();
  }

  const out = run(query, params);
  return out;
}
