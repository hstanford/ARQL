import { SourceConfig } from '@arql/source-postgresql';
import { max } from './functions/max.js';
import { min } from './functions/min.js';
import { count } from './functions/count.js';
import { array } from './functions/array.js';
import { equals, notEquals } from './functions/equals.js';
import { add, minus } from './functions/math.js';
import { or, and } from './functions/logic.js';

export const functions: SourceConfig['functions'] = {
  max,
  min,
  count,
  array,
  equals,
  notEquals,
  add,
  minus,
  or,
  and,
};
