import { FunctionFn } from '@arql/source-postgresql';

export const add: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to add');
  }
  return sql.binaryOperator('+')(args[0], args[1]);
};

export const minus: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to minus');
  }
  return sql.binaryOperator('-')(args[0], args[1]);
};
