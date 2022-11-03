import { applyShape, TransformFn } from '@arql/collector';

export const filter: TransformFn = (
  modifier,
  origin,
  args,
  constituentFields,
  context,
  argFields,
  shape
) => {
  if (!Array.isArray(origin)) {
    throw new Error('Directly filtering multi-origin is not supported');
  }

  let out = origin.filter((record) => args(record)[0]);

  if (shape) {
    out = applyShape(shape, out, constituentFields, context);
  }

  return out;
};
