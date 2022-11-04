import { EXPR, getOperatorLookup, Operator } from '@arql/operators';

export const operators: Operator[] = [
  {
    // a binary operator, comparing any two expressions
    // assert equality between values
    // e.g. test | filter(foo = $1)
    name: 'equals',
    pattern: [EXPR, '=', EXPR],
  },
  {
    // a binary operator, combining any two expressions
    // if either of the two expressions is true, the output is true
    // e.g. test | filter(foo = $1 || bar = $2)
    name: 'or',
    pattern: [EXPR, '||', EXPR],
  },
];

export const opMap = getOperatorLookup(operators);
