import { SourceConfig } from '@arql/source-js';
import { equals } from './operators/equals';
import { or } from './operators/or';

export const operators: SourceConfig['operators'] = {
  equals,
  or,
};
