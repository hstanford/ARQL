import { runner } from '@arql/core';
import { models, testModel, testSource } from './models';
import { operators } from './operators';
import { transforms } from './transforms';

const run = runner({
  models: new Map([['test', testModel]]),
  transforms,
  functions: [],
  opMap: operators,
});

export async function test(query: string) {
  await testSource.init(models, {});
  const out = run(query, []);
  return out;
}
