import { collection, collectionlist, collectionWithShape } from './collection';
import { assertNoError } from './test_helpers';

describe('collection', () => {
  it('should consist of "[base collection or model] [transforms] [shape]"', () => {
    const out = collection.run('u: users | filter(u.id = $1) {name}');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'collection',
      alias: 'u',
      value: {
        type: 'alphachain',
        root: 'users',
        parts: [],
      },
      transforms: [
        {
          type: 'transform',
          args: [
            [
              {
                type: 'alphachain',
                root: 'u',
                parts: ['id'],
              },
              {
                type: 'op',
                symbol: '=',
              },
              {
                type: 'param',
                index: 1,
              },
            ],
          ],
          description: {
            type: 'alphachain',
            root: 'filter',
            parts: [],
          },
        },
      ],
      shape: {
        type: 'shape',
        fields: [
          {
            type: 'field',
            alias: 'name',
            value: {
              type: 'alphachain',
              root: 'name',
              parts: [],
            },
          },
        ],
      },
    });
  });
});

describe('collectionWithShape', () => {
  it('should match a simple field in curly braces', () => {
    const out = collectionWithShape.run('{name: $1}');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'collection',
      alias: undefined,
      transforms: [],
      value: null,
      shape: {
        type: 'shape',
        fields: [
          {
            type: 'field',
            alias: 'name',
            value: {
              type: 'param',
              index: 1,
            },
          },
        ],
      },
    });
  });
});

describe('collectionlist', () => {
  it('should handle a comma-separated list of basic collections', () => {
    const out = collectionlist.run(
      `(
    u: users,
    o: orders
  )`
    );
    assertNoError(out);
    expect(out.result).toEqual([
      {
        type: 'collection',
        alias: 'u',
        value: {
          type: 'alphachain',
          root: 'users',
          parts: [],
        },
        transforms: [],
        shape: null,
      },
      {
        type: 'collection',
        alias: 'o',
        value: {
          type: 'alphachain',
          root: 'orders',
          parts: [],
        },
        transforms: [],
        shape: null,
      },
    ]);
  });
});
