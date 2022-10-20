import { char, many, optionalWhitespace, Parser, sequenceOf } from 'arcsecond';
import { keyword } from './keyword';

export interface Wildcard {
  type: 'wildcard';
  value: '*';
  root?: string;
  parts?: string[];
}

export const wildcard: Parser<Wildcard, string, any> = sequenceOf([
  many(
    sequenceOf([
      keyword,
      optionalWhitespace,
      char('.'),
      optionalWhitespace,
    ]).map((parts) => parts[0])
  ),
  char('*'),
]).map(([[root, ...parts], wcard]) => {
  if (wcard !== '*') {
    throw new Error('Unknown wildcard character');
  }
  return {
    type: 'wildcard',
    value: wcard,
    root,
    parts,
  };
});
