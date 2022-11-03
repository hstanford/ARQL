import { applyShape, TransformFn } from '@arql/source-postgresql';

export const sort: TransformFn = (
  name,
  modifier,
  queries,
  args,
  shape,
  constituentFields,
  context
) => {
  if (queries.length !== 1) {
    throw new Error('Single origin required for sort transform');
  }
  if (!args.length) {
    throw new Error('At least one argument expected for sort transform');
  }
  const query = queries[0];
  let out = query.order(
    ...args.map((arg) =>
      'desc' in arg && modifier.includes('desc') ? arg.desc() : arg
    )
  );

  if (shape) {
    out = applyShape(out, name, shape, constituentFields, context);
  }

  return out;
};
