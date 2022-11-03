import { applyShape, Records, ResultMap, SourceConfig } from '@arql/source-js';

export const transforms: SourceConfig['transforms'] = {
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
  join: (modifier, origin, args, constituentFields, context, shape) => {
    if (Array.isArray(origin)) {
      throw new Error('Multiple origins expected');
    }

    const out: ResultMap[] = [];

    // inner join
    const entries = Object.entries(origin);
    for (const entry of getPermutation(entries)) {
      const [matches] = args(entry);
      if (matches) {
        out.push(entry);
      }
    }

    // TODO: left, right, outer etc joins

    if (shape) {
      return applyShape(shape, out, constituentFields, context);
    }
    return out;
  },
};

function* getPermutation(
  entries: [string, Records][]
): Generator<ResultMap, void, unknown> {
  if (entries.length < 1) throw new Error('No entries!');
  const [name, records] = entries[0];
  if (entries.length === 1) {
    for (const record of records) {
      if (record instanceof Map) {
        throw new Error(
          'Unexpected ResultMap - apply shape before combining further'
        );
      }
      yield new Map([[name, record]]);
    }
  } else {
    for (const record of records) {
      for (const subPermutation of getPermutation(entries.slice(1))) {
        if (record instanceof Map) {
          throw new Error(
            'Unexpected ResultMap - apply shape before combining further'
          );
        }
        subPermutation.set(name, record);
        yield subPermutation;
      }
    }
  }
}
