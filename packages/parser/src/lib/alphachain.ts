import { char, many, optionalWhitespace, Parser, sequenceOf } from 'arcsecond';
import { keyword } from './keyword';

export interface Alphachain {
  type: 'alphachain';
  root: string;
  parts: string[];
}

// keyword preceeded by a "."
export const dotSequence: Parser<string> = sequenceOf([
  char('.'),
  optionalWhitespace,
  keyword,
  optionalWhitespace,
]).map((parts) => parts[2]);

// a list of dot-separated keywords corresponds to accessing a field
// in an object: e.g. users.id or users.settings.dark_mode
export const alphachain: Parser<Alphachain> = sequenceOf([
  keyword,
  optionalWhitespace,
  many(dotSequence),
]).map((parts) => ({
  type: 'alphachain',
  root: parts[0],
  parts: parts[2],
}));

function isAlphaChain(
  ipt: string | Alphachain | null | undefined
): ipt is Alphachain {
  if (typeof ipt === 'string' || !ipt) {
    return false;
  }
  return ipt.type === 'alphachain';
}

export function getAlias(ipt: string | Alphachain | null | undefined) {
  let alias = '';
  if (isAlphaChain(ipt)) {
    alias = [ipt.root, ...ipt.parts].pop() || '';
  } else if (typeof ipt === 'string') {
    alias = ipt;
  }
  return alias;
}
