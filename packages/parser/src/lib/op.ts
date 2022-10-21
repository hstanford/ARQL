import { many1, Parser, regex } from 'arcsecond';

const opChars = [
  '+',
  '-',
  '*',
  '/',
  '<',
  '>',
  '=',
  '~',
  '!',
  '@',
  '#',
  '%',
  '^',
  '&',
  '`',
  '?',
  ':',
  '|',
] as const;
export type OpChar = typeof opChars[number];

export interface Op {
  type: 'op';
  symbol: string;
}

// the characters matched by this regex can be combined to create operators.
// The function, name, and precedence of these operators is defined in the
// "opResolver"
export const opchar: Parser<OpChar> = regex(/^[+\-*/<>=~!@#%^&|`?:]/).map(
  (value) => {
    const char = opChars.find((oc) => oc === value);
    if (char) {
      return char;
    }
    throw new Error(`Unrecognised op character: ${value}`);
  }
);

export const op: Parser<Op> = many1(opchar).map((x) => ({
  type: 'op',
  symbol: x.join(''),
}));
