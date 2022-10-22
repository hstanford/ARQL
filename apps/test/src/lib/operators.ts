import { EXPR, getOperatorLookup } from '@arql/operators';

export const operators = getOperatorLookup([
  {
    name: 'equals',
    pattern: [EXPR, '=', EXPR],
  },
]);
