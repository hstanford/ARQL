import { CollectorConfig } from '@arql/collector';
import { functions } from './functions';
import { operators } from './operators';
import { transforms } from './transforms';

export const collectorConfig: CollectorConfig = {
  functions,
  operators,
  transforms,
};
