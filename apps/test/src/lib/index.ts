import { runner } from '@arql/core';
import { testModel } from './models';
import { operators } from './operators';

const run = runner({
  models: new Map([['test', testModel]]),
  transforms: [
    {
      name: 'filter',
      nArgs: '1',
    },
  ].map((o) => ({ ...o, type: 'transformdef' })),
  functions: [],
  opMap: operators,
});

export function test(query: string) {
  const out = run(query, []);
  return out;
}
