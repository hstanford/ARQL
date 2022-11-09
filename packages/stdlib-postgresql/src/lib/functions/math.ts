import { FunctionFn } from '@arql/source-postgresql';

export const add: FunctionFn = (args, sql, contextualisedArgs) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to add');
  }
  if (contextualisedArgs.some((arg) => arg.dataType?.toString() === 'string')) {
    return sql.binaryOperator('||')(args[0], args[1]);
  }
  return sql.binaryOperator('+')(args[0], args[1]);
};

export const minus: FunctionFn = (args, sql) => {
  if (args.length !== 2) {
    throw new Error('Expect two arguments to minus');
  }
  return sql.binaryOperator('-')(args[0], args[1]);
};
