import { EXPR, getOperatorLookup, Operator } from '@arql/types';
import { assertType } from '@arql/util';
import { functions } from './functions';

type FunctionName = typeof functions[number]['name'];

// assert that all operators have a matching function declaration
export const operators = assertType<
  readonly (Operator & { name: FunctionName })[]
>()([
  {
    // a binary operator
    // concatenate two strings
    // e.g. test | filter(foo `+ $1)
    name: 'strConcat',
    pattern: [EXPR, '`+', EXPR],
  },
  {
    // a binary operator
    // sum values
    // e.g. test | filter(foo + $1)
    name: 'add',
    pattern: [EXPR, '+', EXPR],
  },
  {
    // a binary operator
    // find the difference between two values
    // e.g. test | filter(foo - $1)
    name: 'minus',
    pattern: [EXPR, '-', EXPR],
  },
  {
    // a binary operator, comparing any two expressions
    // assert equality between values
    // e.g. test | filter(foo = $1)
    name: 'equals',
    pattern: [EXPR, '=', EXPR],
  },
  {
    // a binary operator, comparing any two expressions
    // assert inequality between values
    // e.g. test | filter(foo != $1)
    name: 'notEquals',
    pattern: [EXPR, '!=', EXPR],
  },
  {
    // a binary operator, combining any two expressions
    // if both of the two expressions is true, the output is true
    // e.g. test | filter(foo = $1 && bar = $2)
    name: 'and',
    pattern: [EXPR, '&&', EXPR],
  },
  {
    // a binary operator, combining any two expressions
    // if either of the two expressions is true, the output is true
    // e.g. test | filter(foo = $1 || bar = $2)
    name: 'or',
    pattern: [EXPR, '||', EXPR],
  },
] as const);

export const opMap = getOperatorLookup(operators);
