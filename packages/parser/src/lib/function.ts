import {
  char,
  optionalWhitespace,
  Parser,
  possibly,
  recursiveParser,
  sequenceOf,
} from 'arcsecond';
import { Alphachain, alphachain } from './alphachain.js';
import { Expr, exprlist } from './expr.js';

export interface FunctionCall {
  type: 'function';
  name: Alphachain;
  args: Expr[];
}

export const func: Parser<FunctionCall> = recursiveParser(() =>
  sequenceOf([
    alphachain,
    sequenceOf([
      char('('),
      optionalWhitespace,
      possibly(exprlist),
      optionalWhitespace,
      char(')'),
    ]),
  ]).map(([name, func]) => ({
    type: 'function',
    name,
    args: func[2] || [],
  }))
);
