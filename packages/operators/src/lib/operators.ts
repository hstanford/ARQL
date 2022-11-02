import { Expr } from '@arql/parser';

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

// an expression with hierarchy, which indicates the
// resolution order of operations
export interface ExprTree {
  type: 'exprtree';
  op: string;
  args: ETree[];
}

// an expression that _might_ have hierarchy
export type ETree = Expr | ExprTree;

// find the index at which a particular symbol appears in a flat expression list
function indexOfSymbol(arr: ETree[], symbol: string) {
  for (let i = 0; i < arr.length; i++) {
    const item: ETree = arr[i];
    if (!Array.isArray(item) && item.type === 'op' && item.symbol === symbol)
      return i;
  }
  return -1;
}

// given a particular operator in a flat structure of expression tokens,
// attempt to find it and its arguments and replace them with a hierarchical structure
function match(expr: ETree[], op: RankedOperator): void {
  const args: ETree[] = [];

  // find the initial OperatorToken
  const initial = op.pattern.find((val) => !isEXPR(val));
  if (!initial || typeof initial === 'symbol') {
    throw new Error(`Pattern only contains EXPRs`);
  }

  // get the number of expression tokens before we expect the initial OperatorToken
  const initPatternOffset = op.pattern.indexOf(initial);

  // get the first appearance of the initial OperatorToken in the expression list
  const initExprOffset = indexOfSymbol(expr, initial);

  // get the position where the expression should start and
  // assert that it's within the bounds of the expression list
  const pOffset = initExprOffset - initPatternOffset;
  if (pOffset < 0 || pOffset + op.pattern.length > expr.length) {
    throw new Error(`Operator "${initial}" does not match`);
  }

  // add the expression list items in the place of EXPR tokens
  // to the expression arguments
  for (let i = 0; i < op.pattern.length; i++) {
    const item: ETree = expr[i + pOffset];

    // if the position is of an EXPR token, add it to the arguments
    if (isEXPR(op.pattern[i])) {
      args.push(item);
      continue;
    }

    // skip over matching OperatorTokens
    if (
      !Array.isArray(item) &&
      item.type === 'op' &&
      op.pattern[i] === item.symbol
    ) {
      continue;
    }

    throw new Error('No match');
  }

  // matching pattern, splice the parsed expression into place
  expr.splice(pOffset, op.pattern.length, {
    type: 'exprtree',
    op: op.name,
    args,
  });
}

// convert a flat list of expression tokens into a tree which respects
// operator precedence and arity
export function resolver(opMap: OpMap) {
  return function resolve(expr: ETree[] = []) {
    const keys = [];
    const out = [...expr];

    // loop over the expression to pull out operator tokens
    // and to recurse down to nested expressions
    for (const [i, token] of expr.entries()) {
      // recurse nested expressions
      if (Array.isArray(token)) {
        const resolved = resolve(token);
        out.splice(i, i + 1, resolved);
        continue;
      }

      // add operator tokens to the list of found operators
      if (token.type === 'op') {
        keys.push(token.symbol);
      }
    }

    // get an ordered list of operators based on the keys that
    // were found in the expression
    const ops = keys
      .map((key) => {
        const val = opMap.get(key);
        if (!val) throw new Error(`Unknown operator ${key}`);
        return val;
      })
      .sort((a, b) => a.rank - b.rank);

    // deduplicate the list of operators based on the number
    // of operator tokens the operator contains
    const rankedOperators: RankedOperator[] = [];
    let duplicates = 0;
    let operator: RankedOperator | undefined = undefined;
    for (const op of ops) {
      // ignore duplicates
      if (duplicates > 0) {
        if (op !== operator) {
          throw new Error('Unexpected operator token mismatch');
        }
        duplicates--;
        continue;
      }

      // expect (nTokens - 1) duplicates
      duplicates = op.pattern.filter((x) => !isEXPR(x)).length - 1;
      operator = op;
      rankedOperators.push(op);
    }

    // replace sections of the list matching the operators with ExprTrees
    // to get a hierarchy based on operator precedence
    for (const op of rankedOperators) {
      match(out, op);
    }

    return out[0] as ExprTree;
  };
}

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
