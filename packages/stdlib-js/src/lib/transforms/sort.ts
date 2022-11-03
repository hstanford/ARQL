import { applyShape, TransformFn } from '@arql/source-js';
import { compare } from '../util';

export const sort: TransformFn = (
  modifier,
  origin,
  args,
  constituentFields,
  context,
  argFields,
  shape
) => {
  if (!Array.isArray(origin)) {
    throw new Error('Directly sorting multi-origin is not supported');
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
};
