import { parse } from './parser.js';

describe('holistic parser tests', () => {
  it('should be able to parse a basic query', () => {
    const out = parse(
      `
    test | filter(foo = $1) {
      bar
    }
    `,
      'query'
    );
    expect(out).toEqual({
      value: {
        alias: 'test',
        shape: {
          fields: [
            {
              alias: 'bar',
              type: 'field',
              value: {
                parts: [],
                root: 'bar',
                type: 'alphachain',
              },
            },
          ],
          type: 'shape',
        },
        transforms: [
          {
            args: [
              [
                {
                  parts: [],
                  root: 'foo',
                  type: 'alphachain',
                },
                {
                  symbol: '=',
                  type: 'op',
                },
                {
                  index: 1,
                  type: 'param',
                },
              ],
            ],
            description: {
              parts: [],
              root: 'filter',
              type: 'alphachain',
            },
            type: 'transform',
          },
        ],
        type: 'collection',
        value: {
          parts: [],
          root: 'test',
          type: 'alphachain',
        },
      },
      type: 'query',
    });
  });

  it('should be able to parse a complex query with multicollections and aliases', () => {
    const out = parse(
      `
  (
    u: users,
    o: orders,
  ) | join(o.userId = u.id) {
    username: u.name,
    ordername: o.name,
  }
`,
      'query'
    );
    expect(out).toEqual({
      type: 'query',
      value: {
        type: 'collection',
        alias: undefined,
        value: [
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
        ],
        transforms: [
          {
            type: 'transform',
            description: {
              type: 'alphachain',
              root: 'join',
              parts: [],
            },
            args: [
              [
                {
                  type: 'alphachain',
                  root: 'o',
                  parts: ['userId'],
                },
                {
                  type: 'op',
                  symbol: '=',
                },
                {
                  type: 'alphachain',
                  root: 'u',
                  parts: ['id'],
                },
              ],
            ],
          },
        ],
        shape: {
          type: 'shape',
          fields: [
            {
              type: 'field',
              alias: 'username',
              value: {
                type: 'alphachain',
                root: 'u',
                parts: ['name'],
              },
            },
            {
              type: 'field',
              alias: 'ordername',
              value: {
                type: 'alphachain',
                root: 'o',
                parts: ['name'],
              },
            },
          ],
        },
      },
    });
  });
});
