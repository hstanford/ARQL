import { FunctionFn } from '@arql/source-postgresql';

export const strConcat: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to concat');
  }
  return sql.binaryOperator('||')(args[0], args[1]);
};
