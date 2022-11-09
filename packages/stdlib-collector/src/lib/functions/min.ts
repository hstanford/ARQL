import { FunctionFn } from '@arql/collector';
import { FuncDef } from '@arql/stdlib-definitions';

type MinSignature = FunctionFn<FuncDef<'max'>['signature']>;
export const min: MinSignature = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return Math.min(...values);
};
