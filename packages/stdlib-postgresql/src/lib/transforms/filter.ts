import { applyShape, TransformFn } from '@arql/source-postgresql';

export const filter: TransformFn = (
  name,
  modifier,
  queries,
  args,
  shape,
  constituentFields,
  context
) => {
  if (queries.length !== 1) {
    throw new Error('Single origin required for filter transform');
  }
  if (args.length !== 1) {
    throw new Error('Single argument expected for filter transform');
  }
  const query = queries[0];
  let out = query.where(args[0]);
  if (shape) {
    out = applyShape(out, name, shape, constituentFields, context);
  }
  return out;
};
