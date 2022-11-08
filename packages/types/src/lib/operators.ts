export type OperatorToken = string;

// a token identifying parts of an expression
// that can be any other expression or field
export const EXPR = Symbol('EXPR');

export function isEXPR(item: unknown): item is typeof EXPR {
  return item === EXPR;
}

// the definition of an operator signature
// e.g.
// {
//   name: 'equals',
//   pattern: [EXPR, '=', EXPR]
// }
// the pattern indicates the arity and position of operands
export interface Operator {
  name: string;
  pattern: (typeof EXPR | OperatorToken)[];
}

// tracks operator precedence as well as the signature
export interface RankedOperator extends Operator {
  rank: number;
}

// used to find the operator definition for a particular token
export type OpMap = Map<OperatorToken, RankedOperator>;

// convert an ordered array of operators to a lookup of
// <operator token> : <ranked operator definition>
export function getOperatorLookup(operators: Operator[]): OpMap {
  return operators.reduce((acc, item, idx) => {
    const rankedOp = { ...item, rank: idx };
    for (const token of item.pattern) {
      if (token === EXPR) continue;

      acc.set(token, rankedOp);
    }
    return acc;
  }, new Map());
}
