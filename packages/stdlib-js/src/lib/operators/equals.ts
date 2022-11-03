import { OperatorFn } from '@arql/source-js';

export const equals: OperatorFn = ([left, right]) => {
  return left === right;
};
