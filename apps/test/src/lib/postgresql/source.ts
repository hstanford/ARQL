import { PostgreSQL } from '@arql/source-postgresql';
import { functions } from './functions';
import { operators } from './operators';
import { transforms } from './transforms';

export const pgTestSource = new PostgreSQL({
  models: [
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
    {
      name: 'other_users',
      fields: [
        {
          name: 'first_name',
          datatype: 'string' as const,
        },
        {
          name: 'last_name',
          datatype: 'string' as const,
        },
      ],
    },
  ],
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
