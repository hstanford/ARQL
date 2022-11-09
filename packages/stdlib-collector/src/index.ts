import { CollectorConfig } from '@arql/collector';

import { functions } from './lib/functions';
import { transforms } from './lib/transforms';

export const collectorConfig: CollectorConfig = {
  functions,
  transforms,
};
