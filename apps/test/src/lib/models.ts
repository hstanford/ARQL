import { DataModel } from '@arql/models';
import { PostgreSQL } from '@arql/source-postgresql';

export const models = [
  {
    name: 'test',
    fields: [
      {
        name: 'foo',
        datatype: 'string' as const,
      },
      {
        name: 'bar',
        datatype: 'string' as const,
      },
    ],
  },
];

export const testSource = new PostgreSQL(
  models,
  {
    equals: (args, sql) => {
      if (args.length !== 2) {
        throw new Error('Expect two arguments to compute equality');
      }
      return sql.binaryOperator('=')(args[0], args[1]);
    },
    or: (args, sql) => {
      if (args.length !== 2) {
        throw new Error('Expect two arguments to compute "OR"');
      }
      return sql.binaryOperator('OR')(args[0], args[1]);
    },
  },
  {
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
  },
  {}
);

export const testModel = testSource.models.find(
  (m) => m.name === 'test'
) as DataModel;
