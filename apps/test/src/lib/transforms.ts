export const transforms = [
  {
    name: 'filter',
    nArgs: '1',
  },
  {
    name: 'sort',
    nArgs: '1+',
    modifiers: ['desc'],
  },
].map((o) => ({ ...o, type: 'transformdef' as const }));
