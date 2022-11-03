import { EXPR, getOperatorLookup } from '@arql/operators';

export const opMap = getOperatorLookup([
  {
    name: 'equals',
    pattern: [EXPR, '=', EXPR],
  },
  {
    name: 'or',
    pattern: [EXPR, '||', EXPR],
  },
]);
