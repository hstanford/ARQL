import { SourceConfig } from '@arql/source-js';

export const operators: SourceConfig['operators'] = {
  equals: ([left, right]) => {
    return left === right;
  },
  or: ([left, right]) => {
    return left || right;
  },
};
