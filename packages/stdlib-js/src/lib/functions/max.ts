import { FunctionFn } from '@arql/source-js';

export const max: FunctionFn = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return Math.max(...values);
};
