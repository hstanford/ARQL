import { FunctionFn } from '@arql/source-postgresql';

export const equals: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute equality');
  }
  return sql.binaryOperator('=')(args[0], args[1]);
};

export const notEquals: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute inequality');
  }
  return sql.binaryOperator('<>')(args[0], args[1]);
};
