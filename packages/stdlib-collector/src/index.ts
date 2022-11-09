import { CollectorConfig } from '@arql/collector';

import { functions } from './lib/functions.js';
import { transforms } from './lib/transforms.js';

export const collectorConfig: CollectorConfig = {
  functions,
  transforms,
};
