import { SourceConfig } from '@arql/source-js';
import { max } from './functions/max';
import { min } from './functions/min';
import { count } from './functions/count';
import { array } from './functions/array';

export const functions: SourceConfig['functions'] = {
  max,
  min,
  count,
  array,
};
