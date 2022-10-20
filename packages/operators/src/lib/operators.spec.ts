import { EXPR, resolver } from './operators';

describe('operators', () => {
  it('should work', () => {
    const r = resolver(
      new Map([
        [
          '=',
          {
            pattern: [EXPR, '=', EXPR],
            rank: 1,
            name: 'equals',
          },
        ],
      ])
    );
    expect(
      r([
        {
          type: 'alphachain',
          root: 'foo',
          parts: [],
        },
        {
          type: 'op',
          symbol: '=',
        },
        {
          type: 'param',
          index: 0,
        },
      ])
    ).toEqual({
      args: [
        { parts: [], root: 'foo', type: 'alphachain' },
        { index: 0, type: 'param' },
      ],
      op: 'equals',
      type: 'exprtree',
    });
  });
});
