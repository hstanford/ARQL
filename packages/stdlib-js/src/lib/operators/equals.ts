import { OperatorFn } from '@arql/collector';

export const equals: OperatorFn = ([left, right]) => {
  return left === right;
};

export const notEquals: OperatorFn = ([left, right]) => {
  return left !== right;
};
