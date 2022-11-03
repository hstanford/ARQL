import { SourceConfig } from '@arql/source-js';
import { max } from './functions/max';
import { min } from './functions/min';

export const functions: SourceConfig['functions'] = {
  max,
  min,
};
