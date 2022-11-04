import { applyShape, TransformFn } from '@arql/source-postgresql';

export const sort: TransformFn = (
  transform,
  queries,
  args,
  constituentFields,
  context
) => {
  if (queries.length !== 1) {
    throw new Error('Single origin required for sort transform');
  }

  if (!args.length) {
    throw new Error('At least one argument expected for sort transform');
  }

  // alter the existing query: ...query ORDER BY ...args
  const query = queries[0];
  let out = query.order(
    ...args.map((arg) =>
      'desc' in arg && transform.modifier.includes('desc') ? arg.desc() : arg
    )
  );

  if (transform.shape) {
    out = applyShape(
      out,
      transform.name,
      transform.shape,
      constituentFields,
      context
    );
  }

  return out;
};
