import { FunctionFn } from '@arql/source-postgresql';

// aggregate count function
export const count: FunctionFn = (args, sql, contextualisedArgs, modifier) => {
  if (args.length !== 1) {
    throw new Error('Expect one argument to count');
  }
  let arg = args[0];
  if (modifier.includes('distinct')) {
    arg = sql.function('DISTINCT')(arg);
  }
  return sql.function('count')(arg);
};
