import {
  char,
  choice,
  optionalWhitespace,
  Parser,
  possibly,
  sepBy,
  sequenceOf,
} from 'arcsecond';
import { alias } from './alias';
import { Collection } from './collection';
import { expr, Expr } from './expr';
import { Wildcard, wildcard } from './wildcard';

export interface Field {
  type: 'field';
  alias: string | null;
  value: Collection | Expr;
}

export const field: Parser<Field, string, any> = sequenceOf([
  possibly(alias),
  optionalWhitespace,
  expr,
]).map((parts) => {
  let alias: string | null = parts[0];
  if (Array.isArray(parts[2])) {
    alias = alias || null;
  } else if (parts[2].type === 'collection') {
    alias = alias || parts[2].alias || null;
  } else if (parts[2].type === 'alphachain') {
    alias = alias || [parts[2].root, ...parts[2].parts].pop() || null;
  }
  return {
    type: 'field',
    alias,
    value: parts[2],
  };
});

export const fieldList: Parser<(Field | Wildcard)[], string, any> = sequenceOf([
  optionalWhitespace,
  sepBy(sequenceOf([optionalWhitespace, char(','), optionalWhitespace]))(
    possibly(choice([wildcard, field]))
  ),
  optionalWhitespace,
]).map((parts) => parts[1].filter((i) => !!i) as (Field | Wildcard)[]);
