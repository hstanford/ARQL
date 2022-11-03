import { OperatorFn } from '@arql/collector';

export const or: OperatorFn = ([left, right]) => {
  return left || right;
};
