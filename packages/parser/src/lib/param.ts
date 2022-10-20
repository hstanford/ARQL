import { char, digits, Parser, sequenceOf } from 'arcsecond';

export interface Param {
  type: 'param';
  index: number;
}

// all variables and primitives like strings, numbers and booleans in a query
// must be parameterised out to eliminate the risk of injection vulnerabilities.
// Refer to the parameters by their index in the array of parameters e.g. "$3"
export const param: Parser<Param, string, any> = sequenceOf([
  char('$'),
  digits,
]).map(([, index]) => ({
  type: 'param',
  index: Number(index),
}));
