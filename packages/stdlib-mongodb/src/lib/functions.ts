import { SourceConfig } from '@arql/source-mongodb';
import { equals, notEquals } from './functions/equals.js';
import { add, minus } from './functions/math.js';
import { or, and } from './functions/logic.js';

export const functions: SourceConfig['functions'] = {
  equals,
  notEquals,
  add,
  minus,
  or,
  and,
};
