import { FunctionFn } from '@arql/source-js';

export const add: FunctionFn = ([left, right]) => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right;
  } else {
    throw new Error('Could not sum values');
  }
};

export const minus: FunctionFn = ([left, right]) => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  } else {
    throw new Error('Could not minus values');
  }
};
