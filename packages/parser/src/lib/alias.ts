import { char, optionalWhitespace, Parser, sequenceOf } from 'arcsecond';
import { keyword } from './keyword';

// change the name used for field or collection down the data pipeline
// by using ":" e.g. "u: users" allows "users" to be referred to as
// "u" later on
export const alias: Parser<string, string, any> = sequenceOf([
  keyword,
  optionalWhitespace,
  char(':'),
]).map((parts) => parts[0]);
