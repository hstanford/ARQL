import { buildField, SubQuery, TransformFn } from '@arql/source-postgresql';

export const group: TransformFn = (
  transform,
  queries,
  args,
  constituentFields,
  context
) => {
  if (queries.length !== 1) {
    throw new Error('Single origin required for group transform');
  }

  if (args.length < 1) {
    throw new Error('At least one argument expected for group transform');
  }

  const query = queries[0];

  // produce a subquery: SELECT ...shape FROM origin GROUP BY ...args
  let out = query.table
    .subQuery(transform.name)
    .from(query)
    .group(...args) as SubQuery;

  if (transform.shape) {
    out = out.select(
      ...transform.shape.map((f) => buildField(f, constituentFields, context))
    );
  }

  return out;
};
