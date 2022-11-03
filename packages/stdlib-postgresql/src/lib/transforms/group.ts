import { buildField, SubQuery, TransformFn } from '@arql/source-postgresql';

export const group: TransformFn = (
  name,
  modifier,
  queries,
  args,
  shape,
  constituentFields,
  context
) => {
  if (queries.length !== 1) {
    throw new Error('Single origin required for group transform');
  }
  if (args.length < 1) {
    throw new Error('At least one argument expected for filter transform');
  }
  const query = queries[0];

  let out = query.table
    .subQuery(name)
    .from(query)
    .group(...args) as SubQuery;

  if (shape) {
    out = out.select(
      ...shape.map((f) => buildField(f, constituentFields, context))
    );
  }

  return out;
};
