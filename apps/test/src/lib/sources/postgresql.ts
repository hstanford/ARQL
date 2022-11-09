import { PostgreSQL } from '@arql/source-postgresql';
import { transforms, functions } from '@arql/stdlib-postgresql';

export const pgTestSource = new PostgreSQL({
  models: [],
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
