import { TransformDef } from '@arql/models';

export const transforms: TransformDef[] = [
  {
    name: 'filter',
    nArgs: '1',
  },
  {
    name: 'sort',
    nArgs: '1+',
    modifiers: ['desc'],
  },
  {
    name: 'join',
    nArgs: '1',
  },
  {
    name: 'group',
    nArgs: '1+',
  },
];
