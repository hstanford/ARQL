import { OperatorFn } from '@arql/source-postgresql';

export const or: OperatorFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute "OR"');
  }
  return sql.binaryOperator('OR')(args[0], args[1]);
};

export const and: OperatorFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to compute "AND"');
  }
  return sql.binaryOperator('AND')(args[0], args[1]);
};
