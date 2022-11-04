import { applyShape, TransformFn, resolveArgs, Row } from '@arql/source-js';
import { compare } from '../util';

export const sort: TransformFn = (
  transform,
  origin,
  constituentFields,
  context
) => {
  if (!Array.isArray(origin)) {
    throw new Error('Directly sorting multi-origin is not supported');
  }

  function args(record: Row) {
    return resolveArgs(transform, record, constituentFields, context);
  }

  let out = origin.sort((record1, record2) => {
    let init = 0;
    const argList1 = args(record1);
    const argList2 = args(record2);

    // compare each set of values in order, e.g. for sort(a, b) we
    // first compare record1.a to record2.a, then record1.b to record2.b
    for (const idx in argList1) {
      const val = compare(argList1[idx], argList2[idx]);

      // specify sorting direction using a modifier e.g. "sort.desc(a)"
      init = transform.modifier.includes('desc') ? init - val : init + val;

      // for each set of values, if they differ then we don't need to check further
      if (init) break;
    }
    return init;
  });

  if (transform.shape) {
    out = applyShape(transform.shape, out, constituentFields, context);
  }

  return out;
};
