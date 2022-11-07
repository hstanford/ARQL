import { OperatorFn } from '@arql/source-js';

export const strConcat: OperatorFn = ([left, right]) => {
  if (typeof left !== 'string' || typeof right !== 'string') {
    throw new Error('Could not sum values');
  }
  return left + right;
};
