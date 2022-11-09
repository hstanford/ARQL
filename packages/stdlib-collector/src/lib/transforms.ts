import { CollectorConfig } from '@arql/collector';
import { filter } from './transforms/filter.js';
import { group } from './transforms/group.js';
import { join } from './transforms/join.js';
import { sort } from './transforms/sort.js';

export const transforms: CollectorConfig['transforms'] = {
  filter,
  sort,
  join,
  group,
};
