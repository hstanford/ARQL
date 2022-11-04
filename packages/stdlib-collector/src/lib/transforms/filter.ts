import { applyShape, resolveArgs, TransformFn } from '@arql/collector';

export const filter: TransformFn = (
  transform,
  origin,
  constituentFields,
  context
) => {
  if (!Array.isArray(origin)) {
    throw new Error('Directly filtering multi-origin is not supported');
  }

  let out = origin.filter(
    (record) => resolveArgs(transform, record, constituentFields, context)[0]
  );

  if (transform.shape) {
    out = applyShape(transform.shape, out, constituentFields, context);
  }

  return out;
};
