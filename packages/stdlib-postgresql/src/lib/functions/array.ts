import { FunctionFn } from '@arql/source-postgresql';

// aggregate array function
export const array: FunctionFn = (args, sql) => {
  if (args.length !== 1) {
    throw new Error('Expect one argument to count');
  }
  return sql.function('array_agg')(args[0]);
};
