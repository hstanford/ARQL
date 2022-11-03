import { CollectorConfig } from '@arql/collector';
import { max } from './functions/max';
import { min } from './functions/min';

export const functions: CollectorConfig['functions'] = {
  max,
  min,
};
