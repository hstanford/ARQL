import { applyShape, resolveArgs, Row, TransformFn } from '@arql/collector';
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
    for (const idx in argList1) {
      const val = compare(argList1[idx], argList2[idx]);
      init = transform.modifier.includes('desc') ? init - val : init + val;
      if (init) break;
    }
    return init;
  });

  if (transform.shape) {
    out = applyShape(transform.shape, out, constituentFields, context);
  }

  return out;
};
