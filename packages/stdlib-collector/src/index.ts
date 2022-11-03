import { CollectorConfig } from '@arql/collector';

import { functions } from './lib/functions';
import { operators } from './lib/operators';
import { transforms } from './lib/transforms';

export const collectorConfig: CollectorConfig = {
  functions,
  operators,
  transforms,
};
