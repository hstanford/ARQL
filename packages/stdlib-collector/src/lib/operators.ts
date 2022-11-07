import { CollectorConfig } from '@arql/collector';
import { equals, notEquals } from './operators/equals';
import { add, minus } from './operators/math';
import { or, and } from './operators/logic';
import { strConcat } from './operators/string';

export const operators: CollectorConfig['operators'] = {
  equals,
  notEquals,
  add,
  minus,
  or,
  and,
  strConcat,
};
