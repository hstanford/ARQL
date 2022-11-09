import { FunctionFn } from '@arql/source-js';
import { FuncDef } from '@arql/stdlib-definitions';

type CountSignature = FunctionFn<FuncDef<'count'>['signature']>;
export const count: CountSignature = ([values], modifier) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  if (modifier.includes('distinct')) {
    return values.filter((val, idx) => values.indexOf(val) === idx).length;
  }

  return values.length;
};
