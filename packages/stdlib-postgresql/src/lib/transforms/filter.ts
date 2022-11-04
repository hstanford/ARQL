import { applyShape, TransformFn } from '@arql/source-postgresql';

export const filter: TransformFn = (
  transform,
  queries,
  args,
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
