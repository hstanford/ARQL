import { buildField, TransformFn } from '@arql/source-postgresql';
import { Node } from 'sql-ts';

export const join: TransformFn = (
  transform,
  queries,
  args,
  constituentFields,
  context
) => {
  if (queries.length !== 2) {
    throw new Error('Can only join exactly 2 queries');
  }

  if (args.length !== 1) {
    throw new Error('Exactly one argument expected for join transform');
  }

  // produce a subquery: SELECT ...shape FROM origin1 JOIN origin2 ON args[0]
  const fromClause = queries[0].join(queries[1]).on(args[0] as unknown as Node);

  let out = queries[0].table.subQuery(transform.name).from(fromClause);

  if (transform.shape) {
    out = out.select(
      ...transform.shape.map((f) => buildField(f, constituentFields, context))
    );
  }

  return out;
};
