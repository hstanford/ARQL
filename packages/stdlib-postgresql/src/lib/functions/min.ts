import { FunctionFn } from '@arql/source-postgresql';

// aggregate min function
export const min: FunctionFn = (args, sql) => {
  if (args.length !== 1) {
    throw new Error('Expect one argument to max');
  }
  return sql.function('min')(args[0]);
};
