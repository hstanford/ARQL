import { FunctionFn } from '@arql/source-postgresql';

// aggregate max function
export const max: FunctionFn = (args, sql) => {
  if (args.length !== 1) {
    throw new Error('Expect one argument to max');
  }
  return sql.function('max')(args[0]);
};
