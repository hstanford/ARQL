export const transforms = [
  {
    name: 'filter',
    nArgs: '1',
  },
].map((o) => ({ ...o, type: 'transformdef' as const }));
