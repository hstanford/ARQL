import { runner } from '@arql/core';
import { collectorConfig } from '@arql/stdlib-collector';
import { transforms, functions, opMap } from '@arql/stdlib-definitions';
import { sources } from './sources.js';

for (const source of sources) {
  await source.init();
}

const models = new Map(
  sources
    .map((s) => s.models)
    .flat()
    .map((m) => [m.name, m])
);

const run = runner({
  contextualiserConfig: {
    models,
    transforms: [...transforms],
    functions: [...functions],
    opMap,
  },
  collectorConfig: collectorConfig,
});

export async function test(query: string, params: unknown[]) {
  return run(query, params);
}
