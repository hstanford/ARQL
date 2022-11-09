import { FunctionFn } from '@arql/collector';

export const equals: FunctionFn = ([left, right]) => {
  return left === right;
};

export const notEquals: FunctionFn = ([left, right]) => {
  return left !== right;
};
