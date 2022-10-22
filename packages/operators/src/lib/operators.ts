/**
 * OP RESOLVER
 *
 * The Op Resolver takes user-defined operators and turns a flat
 * list of symbols and values into a tree based on precedence and
 * arity of the operators
 */

import { Expr } from '@arql/parser';

export const EXPR = Symbol('EXPR');

export interface Operator {
  name: string;
  pattern: (symbol | string)[];
}

export interface RankedOperator extends Operator {
  rank: number;
}

export interface ExprTree {
  type: 'exprtree';
  op: string;
  args: (Expr | ExprTree)[];
}

function indexOfSymbol(arr: (Expr | ExprTree)[], symbol: string) {
  for (let i = 0; i < arr.length; i++) {
    const item: Expr | ExprTree = arr[i];
    if (!Array.isArray(item) && item.type === 'op' && item.symbol === symbol)
      return i;
  }
  return -1;
}

function match(expr: (Expr | ExprTree)[], op: RankedOperator) {
  const args = [];
  const initial = op.pattern.find((val) => !(typeof val === 'symbol'));
  if (!initial || typeof initial === 'symbol') {
    throw new Error(`Pattern only contains EXPRs`);
  }
  const initPatternOffset = op.pattern.indexOf(initial);

  const initExprOffset = indexOfSymbol(expr, initial);
  const pOffset = initExprOffset - initPatternOffset;
  if (pOffset < 0 || pOffset + op.pattern.length > expr.length) {
    throw new Error(`Operator "${initial}" does not match`);
  }

  for (let i = 0; i < op.pattern.length; i++) {
    const item: Expr | ExprTree = expr[i + pOffset];
    if (!Array.isArray(item) && item.type === 'op') {
      if (op.pattern[i] !== item.symbol) throw new Error('No match');
    } else {
      if (!(typeof op.pattern[i] === 'symbol')) throw new Error('No match');

      args.push(expr[i + pOffset]);
    }
  }

  // matching pattern, splice
  const exprTree: ExprTree = {
    type: 'exprtree',
    op: op.name,
    args,
  };
  expr.splice(pOffset, op.pattern.length, exprTree);
}

export function resolver(opMap: Map<string, RankedOperator>) {
  return function resolve(expr: (Expr | ExprTree)[] = []) {
    const keys = [];
    const out = [...expr];
    for (const [i, token] of expr.entries()) {
      // recurse nested expressions
      if (Array.isArray(token)) {
        const resolved = resolve(token);
        out.splice(i, i + 1, resolved);
        continue;
      }
      if (token.type === 'op') {
        keys.push(token.symbol);
      }
    }

    const ops = keys
      .map((key) => {
        const val = opMap.get(key);
        if (!val) throw new Error(`Unknown operator ${key}`);
        return val;
      })
      .sort((a, b) => a.rank - b.rank);

    let op;
    while (ops.length) {
      op = ops.shift();
      if (!op) continue;
      for (
        let i = 0;
        i < op.pattern.filter((x) => !(typeof x === 'symbol')).length - 1;
        i++
      )
        ops.shift();
      match(out, op);
    }

    return out[0] as ExprTree;
  };
}

export function getOperatorLookup(
  operators: Operator[]
): Map<string, RankedOperator> {
  return operators.reduce((acc, item, idx) => {
    for (const token of item.pattern) {
      if (token === EXPR) continue;

      acc.set(token, { ...item, rank: idx });
    }
    return acc;
  }, new Map());
}
