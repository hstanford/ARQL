import { SourceConfig } from '@arql/source-postgresql';
import { filter } from './transforms/filter.js';
import { group } from './transforms/group.js';
import { join } from './transforms/join.js';
import { sort } from './transforms/sort.js';

export const transforms: SourceConfig['transforms'] = {
  filter,
  sort,
  join,
  group,
};
