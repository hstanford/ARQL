import { FunctionFn } from '@arql/source-js';

export const count: FunctionFn = ([values], modifier) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  if (modifier.includes('distinct')) {
    return values.filter((val, idx) => values.indexOf(val) === idx).length;
  }

  return values.length;
};
