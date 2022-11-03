import { runner } from '@arql/core';
import { collectorConfig } from './collector/config';
import { contextualiserConfig } from './contextualiser/config';
import { sources } from './data';

const run = runner({
  contextualiserConfig,
  collectorConfig,
});

export async function test(query: string, params: unknown[]) {
  for (const source of sources) {
    await source.init();
  }

  const out = run(query, params);
  return out;
}
