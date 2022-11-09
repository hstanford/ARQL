import { FunctionFn } from '@arql/collector';
import { FuncDef } from '@arql/stdlib-definitions';

type MaxSignature = FunctionFn<FuncDef<'max'>['signature']>;
export const max: MaxSignature = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return Math.max(...values);
};
