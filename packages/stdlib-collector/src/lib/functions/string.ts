import { FunctionFn } from '@arql/collector';

export const strConcat: FunctionFn = ([left, right]) => {
  if (typeof left !== 'string' || typeof right !== 'string') {
    throw new Error('Both arguments must be strings to concatenate');
  }
  return left + right;
};
