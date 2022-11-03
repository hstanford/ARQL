import { CollectorConfig } from '@arql/collector';
import { equals } from './operators/equals';
import { or } from './operators/or';

export const operators: CollectorConfig['operators'] = {
  equals,
  or,
};
