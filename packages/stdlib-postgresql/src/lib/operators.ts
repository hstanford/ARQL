import { SourceConfig } from '@arql/source-postgresql';
import { equals, notEquals } from './operators/equals';
import { add, minus } from './operators/math';
import { or, and } from './operators/logic';
import { strConcat } from './operators/string';

export const operators: SourceConfig['operators'] = {
  equals,
  notEquals,
  add,
  minus,
  or,
  and,
  strConcat,
};
