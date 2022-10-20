import { many1, Parser, regex } from 'arcsecond';

export type OpChar =
  | '+'
  | '-'
  | '*'
  | '/'
  | '<'
  | '>'
  | '='
  | '~'
  | '!'
  | '@'
  | '#'
  | '%'
  | '^'
  | '&'
  | '`'
  | '?'
  | ':'
  | '|';

export interface Op {
  type: 'op';
  symbol: string;
}

// the characters matched by this regex can be combined to create operators.
// The function, name, and precedence of these operators is defined in the
// "opResolver"
export const opchar: Parser<OpChar, string, any> = regex(
  /^[+\-*/<>=~!@#%^&|`?:]/
) as Parser<any, string, any>;
export const op: Parser<Op, string, any> = many1(opchar).map((x) => ({
  type: 'op',
  symbol: x.join(''),
}));
