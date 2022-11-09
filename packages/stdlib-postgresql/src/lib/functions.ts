import { SourceConfig } from '@arql/source-postgresql';
import { max } from './functions/max';
import { min } from './functions/min';
import { count } from './functions/count';
import { array } from './functions/array';
import { equals, notEquals } from './functions/equals';
import { add, minus } from './functions/math';
import { or, and } from './functions/logic';

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
