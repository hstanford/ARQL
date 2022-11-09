import { FunctionFn } from '@arql/collector';

export const or: FunctionFn = ([left, right]) => {
  return left || right;
};

export const and: FunctionFn = ([left, right]) => {
  return left && right;
};
