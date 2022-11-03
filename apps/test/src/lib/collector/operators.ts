import { CollectorConfig } from '@arql/collector';

export const operators: CollectorConfig['operators'] = {
  equals: ([left, right]) => {
    return left === right;
  },
  or: ([left, right]) => {
    return left || right;
  },
};
