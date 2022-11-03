import { SourceConfig } from '@arql/source-postgresql';
import { Node } from 'sql-ts';

export const transforms: SourceConfig['transforms'] = {
  filter: (modifier, queries, args) => {
    if (queries.length !== 1) {
      throw new Error('Single origin required for filter transform');
    }
    if (args.length !== 1) {
      throw new Error('Single argument expected for filter transform');
    }
    const query = queries[0];
    return query.where(args[0]);
  },
  sort: (modifier, queries, args) => {
    if (queries.length !== 1) {
      throw new Error('Single origin required for sort transform');
    }
    if (!args.length) {
      throw new Error('At least one argument expected for sort transform');
    }
    const query = queries[0];
    return query.order(
      ...args.map((arg) =>
        'desc' in arg && modifier.includes('desc') ? arg.desc() : arg
      )
    );
  },
  join: (modifier, queries, args) => {
    if (queries.length !== 2) {
      throw new Error('Can only join exactly 2 queries');
    }
    if (args.length !== 1) {
      throw new Error('Exactly one argument expected for join transform');
    }

    const fromClause = queries[0]
      .join(queries[1])
      .on(args[0] as unknown as Node);

    return fromClause;
  },
};
