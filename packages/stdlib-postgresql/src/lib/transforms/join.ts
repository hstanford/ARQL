import { buildField, TransformFn } from '@arql/source-postgresql';
import { Node } from 'sql-ts';

export const join: TransformFn = (
  name,
  modifier,
  queries,
  args,
  shape,
  constituentFields,
  context
) => {
  if (queries.length !== 2) {
    throw new Error('Can only join exactly 2 queries');
  }
  if (args.length !== 1) {
    throw new Error('Exactly one argument expected for join transform');
  }

  const fromClause = queries[0].join(queries[1]).on(args[0] as unknown as Node);

  let out = queries[0].table.subQuery(name).from(fromClause);

  if (shape) {
    out = out.select(
      ...shape.map((f) => buildField(f, constituentFields, context))
    );
  }

  return out;
};
