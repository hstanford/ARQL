import { CollectorConfig } from '@arql/collector';
import { filter } from './transforms/filter';
import { group } from './transforms/group';
import { join } from './transforms/join';
import { sort } from './transforms/sort';

export const transforms: CollectorConfig['transforms'] = {
  filter,
  sort,
  join,
  group,
};
