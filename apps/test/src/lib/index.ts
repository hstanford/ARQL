import { applyShape } from '@arql/collector';
import { runner } from '@arql/core';
import { models, testModel, testSource } from './models';
import { operators } from './operators';
import { transforms } from './transforms';

const run = runner({
  contextualiserConfig: {
    models: new Map([['test', testModel]]),
    transforms,
    functions: [],
    opMap: operators,
  },
  collectorConfig: {
    transforms: {
      filter: (modifier, origin, args, constituentFields, context, shape) => {
        if (!Array.isArray(origin)) {
          throw new Error('Directly filtering multi-origin is not supported');
        }
        let out = origin.filter((record) => args(record)[0]);
        if (shape) {
          out = applyShape(shape, out, constituentFields, context);
        }
        return out;
      },
      sort: (modifier, origin, args, constituentFields, context, shape) => {
        if (!Array.isArray(origin)) {
          throw new Error('Directly sorting multi-origin is not supported');
        }
        function compare(a: unknown, b: unknown) {
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
          } else {
            return ('' + a).localeCompare('' + b);
          }
        }
        let out = origin.sort((record1, record2) => {
          let init = 0;
          const argList1 = args(record1);
          const argList2 = args(record2);
          for (const idx in argList1) {
            const val = compare(argList1[idx], argList2[idx]);
            init = modifier.includes('desc') ? init - val : init + val;
            if (init) break;
          }
          return init;
        });
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
