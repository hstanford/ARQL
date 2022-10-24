import { runner } from '@arql/core';
import { testModel } from './models';
import { operators } from './operators';
import { transforms } from './transforms';

const run = runner({
  models: new Map([['test', testModel]]),
  transforms,
  functions: [],
  opMap: operators,
});

export function test(query: string) {
  const out = run(query, []);
  return out;
}
