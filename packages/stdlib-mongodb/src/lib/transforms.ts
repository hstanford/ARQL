import { SourceConfig } from '@arql/source-mongodb';
import { filter } from './transforms/filter.js';

export const transforms: SourceConfig['transforms'] = {
  filter,
};
