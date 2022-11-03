import { DataModelDef } from '@arql/models';
import { PostgreSQL } from '@arql/source-postgresql';
import { operators, transforms, functions } from '@arql/stdlib-postgresql';

export const pgTestSource = new PostgreSQL({
  models: [
    {
      name: 'test',
      fields: [
        {
          name: 'foo',
          datatype: 'string',
        },
        {
          name: 'bar',
          datatype: 'string',
        },
        {
          name: 'age',
          datatype: 'number',
        },
      ],
    },
    {
      name: 'other_users',
      fields: [
        {
          name: 'first_name',
          datatype: 'string',
        },
        {
          name: 'last_name',
          datatype: 'string',
        },
      ],
    },
  ] as DataModelDef[],
  operators,
  transforms,
  functions,
  connectionVariables: {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  },
});
