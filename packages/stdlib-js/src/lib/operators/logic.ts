import { OperatorFn } from '@arql/source-js';

export const or: OperatorFn = ([left, right]) => {
  return left || right;
};

export const and: OperatorFn = ([left, right]) => {
  return left && right;
};
