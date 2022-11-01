import { applyShape } from '@arql/collector';
import { runner } from '@arql/core';
import { models, testModel, testSource } from './models';
import { operators } from './operators';
import { transforms } from './transforms';

const run = runner({
  models: new Map([['test', testModel]]),
  transforms,
  functions: [],
  opMap: operators,
  collectorConfig: {
    transforms: {
      filter: (origin, args, constituentFields, context, shape) => {
        if (!Array.isArray(origin)) {
          throw new Error('Directly filtering multi-origin is not supported');
        }
        let out = origin.filter((record) => args(record)[0]);
        if (shape) {
          out = applyShape(shape, out, constituentFields, context);
        }
        return out;
      },
    },
    functions: {},
    operators: {
      equals: ([left, right]) => {
        return left === right;
      },
      or: ([left, right]) => {
        return left || right;
      },
    },
  },
});

export async function test(query: string, params: unknown[]) {
  await testSource.init(models, {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  });
  const out = run(query, params);
  return out;
}
