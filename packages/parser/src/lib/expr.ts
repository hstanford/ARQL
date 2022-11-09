import {
  char,
  choice,
  many,
  many1,
  optionalWhitespace,
  Parser,
  possibly,
  recursiveParser,
  sequenceOf,
} from 'arcsecond';
import { Alphachain, alphachain } from './alphachain.js';
import {
  Collection,
  collectionWithShape,
  collectionWithTransforms,
} from './collection.js';
import { func, FunctionCall } from './function.js';
import { op, Op } from './op.js';
import { Param, param } from './param.js';

export type BaseExpr = Param | Alphachain | Collection | FunctionCall | Op;
export type Expr = BaseExpr | Expr[];

// an expression is a series of parameters, fields, or collections transformed
// in some way by operators and functions. Parentheses group sections of the
// expression and can be used to subvert or clarify operator precedence.
export const exprNoOp: Parser<Expr> = recursiveParser(function () {
  return choice([
    sequenceOf([
      char('('),
      optionalWhitespace,
      expr,
      optionalWhitespace,
      char(')'),
    ]).map((parts) => parts[2]),
    func,
    param,
    alphachain,
  ]);
});

export const exprOp = recursiveParser(function () {
  return sequenceOf([
    many(sequenceOf([op, optionalWhitespace]).map((parts) => parts[0])),
    exprNoOp,
    optionalWhitespace,
    many(
      sequenceOf([
        many1(sequenceOf([op, optionalWhitespace]).map((parts) => parts[0])),
        optionalWhitespace,
        exprNoOp,
        optionalWhitespace,
      ]).map((parts) => [...parts[0], parts[2]])
    ),
    many(sequenceOf([op, optionalWhitespace]).map((parts) => parts[0])),
  ]).map((parts) => {
    const args = [
      ...parts[0],
      parts[1],
      ...parts[3].flat(),
      ...parts[4],
    ].filter((arg): arg is Expr => !!arg);
    return args.length === 1 ? args[0] : args;
  });
});

export const expr: Parser<Expr | Expr[]> = recursiveParser(() =>
  choice([collectionWithTransforms, collectionWithShape, exprOp, exprNoOp])
);

// a comma-separated list of expressions form function arguments
export const exprlist: Parser<Expr[] | null> = possibly(
  sequenceOf([
    expr,
    optionalWhitespace,
    many(
      sequenceOf([char(','), optionalWhitespace, expr, optionalWhitespace]).map(
        (parts) => parts[2]
      )
    ),
    possibly(char(',')),
  ]).map((parts) => [parts[0], ...parts[2]].filter((p) => p !== null))
);
