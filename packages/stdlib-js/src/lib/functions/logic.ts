import { FunctionFn } from '@arql/source-js';

export const or: FunctionFn = ([left, right]) => {
  return left || right;
};

export const and: FunctionFn = ([left, right]) => {
  return left && right;
};
