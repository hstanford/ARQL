import { CollectorConfig } from '@arql/collector';
import { max } from './functions/max';
import { min } from './functions/min';
import { count } from './functions/count';
import { array } from './functions/array';

export const functions: CollectorConfig['functions'] = {
  max,
  min,
  count,
  array,
};
