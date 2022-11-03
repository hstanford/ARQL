import { SourceConfig } from '@arql/source-postgresql';
import { equals } from './operators/equals';
import { or } from './operators/or';

export const operators: SourceConfig['operators'] = {
  equals,
  or,
};
