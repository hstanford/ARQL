import { FunctionFn } from '@arql/collector';

export const min: FunctionFn = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return Math.min(...values);
};
