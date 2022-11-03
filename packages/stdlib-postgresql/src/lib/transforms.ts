import { SourceConfig } from '@arql/source-postgresql';
import { filter } from './transforms/filter';
import { group } from './transforms/group';
import { join } from './transforms/join';
import { sort } from './transforms/sort';

export const transforms: SourceConfig['transforms'] = {
  filter,
  sort,
  join,
  group,
};
