import { OperatorFn } from '@arql/source-postgresql';

export const equals: OperatorFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute equality');
  }
  return sql.binaryOperator('=')(args[0], args[1]);
};

export const notEquals: OperatorFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute inequality');
  }
  return sql.binaryOperator('<>')(args[0], args[1]);
};
