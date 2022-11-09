import { FunctionFn } from '@arql/collector';
import { FuncDef } from '@arql/stdlib-definitions';

type ArraySignature = FunctionFn<FuncDef<'array'>['signature']>;
export const array: ArraySignature = ([values]) => {
  if (!Array.isArray(values)) {
    throw new Error('Expected array input for aggregate function');
  }

  return values;
};
