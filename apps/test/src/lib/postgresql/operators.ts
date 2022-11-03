import { SourceConfig } from '@arql/source-postgresql';

export const operators: SourceConfig['operators'] = {
  equals: (args, sql) => {
    if (args.length !== 2) {
      throw new Error('Expect two arguments to compute equality');
    }
    return sql.binaryOperator('=')(args[0], args[1]);
  },
  or: (args, sql) => {
    if (args.length !== 2) {
      throw new Error('Expect two arguments to compute "OR"');
    }
    return sql.binaryOperator('OR')(args[0], args[1]);
  },
};
