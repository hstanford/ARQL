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
import { alphachain, Alphachain } from './alphachain.js';
import { collection, Collection } from './collection.js';
import { expr, Expr } from './expr.js';
import { shape, Shape } from './shape.js';

export interface Transform {
  type: 'transform';
  description: Alphachain;
  args: (Expr | Shape | Collection)[];
}

// transforms are functions applied to collections. Examples include filters,
// sorts, limits/offsets, joins, unions, and aggregate functions.
// They are invoked like functions, e.g. filter(users.id = orders.userId)
export const transformArg: Parser<Expr | Shape | Collection> = recursiveParser(
  () => choice([shape, expr, collection])
);

export const transformArgs: Parser<(Expr | Shape | Collection)[] | null> =
  possibly(
    sequenceOf([
      transformArg,
      optionalWhitespace,
      many(
        sequenceOf([
          char(','),
          optionalWhitespace,
          transformArg,
          optionalWhitespace,
        ]).map((parts) => parts[2])
      ),
      possibly(char(',')),
    ]).map((parts) => [parts[0], ...parts[2]].filter((p) => p !== null))
  );

export const transform: Parser<Transform> = sequenceOf([
  alphachain,
  optionalWhitespace,
  possibly(
    sequenceOf([
      char('('),
      optionalWhitespace,
      transformArgs,
      optionalWhitespace,
      char(')'),
    ]).map((parts) => parts[2])
  ),
]).map((parts) => ({
  type: 'transform',
  description: parts[0],
  args: parts[2] || [],
}));

export const possiblyTransforms: Parser<Transform[]> = many(
  sequenceOf([
    char('|'),
    optionalWhitespace,
    transform,
    optionalWhitespace,
  ]).map((parts) => parts[2])
);

// transforms are applied to a collection using a vertical bar, conceptually
// similar to the "pipe" in unix.
export const transforms: Parser<Transform[]> = many1(
  sequenceOf([
    char('|'),
    optionalWhitespace,
    transform,
    optionalWhitespace,
  ]).map((parts) => parts[2])
);
