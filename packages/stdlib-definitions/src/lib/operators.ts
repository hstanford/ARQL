import { EXPR, getOperatorLookup, Operator } from '@arql/operators';

export const operators: Operator[] = [
  {
    name: 'equals',
    pattern: [EXPR, '=', EXPR],
  },
  {
    name: 'or',
    pattern: [EXPR, '||', EXPR],
  },
];

export const opMap = getOperatorLookup(operators);
