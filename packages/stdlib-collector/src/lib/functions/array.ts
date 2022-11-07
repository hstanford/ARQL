import { FunctionFn } from '@arql/collector';

export const array: FunctionFn = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return values;
};
