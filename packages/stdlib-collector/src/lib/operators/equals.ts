import { OperatorFn } from '@arql/collector';

export const equals: OperatorFn = ([left, right]) => {
  return left === right;
};
