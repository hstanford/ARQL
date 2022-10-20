import { run } from './parser';

test('keyword parses a single word correctly', () => {
  const out = run('hello', 'keyword');
  expect(out).toBe('hello');
});

test('keyword takes only the first word of multiple', () => {
  const out = run('hello world', 'keyword');
  expect(out).toBe('hello');
});

test('keyword supports numbers after the first alpha char', () => {
  let out: string | null = run('h3llo', 'keyword');
  expect(out).toBe('h3llo');
  try {
    out = run('3ello', 'keyword');
  } catch (e) {
    out = null;
  }
  expect(out).toBeNull();
});

test('dotSequence matches one keyword preceeded by "."', () => {
  let out;
  try {
    out = run('', 'dotSequence');
  } catch (e) {
    // do nothing
  }
  expect(out).toBeUndefined();
  out = run('.hello', 'dotSequence');
  expect(out).toBe('hello');
});

test('alphachain matches one or more dot-separated keywords', () => {
  let out;
  try {
    out = run('', 'alphachain');
  } catch (e) {
    // do nothing
  }
  expect(out).toBeUndefined();
  out = run('hello', 'alphachain');
  expect(out).toEqual({ type: 'alphachain', root: 'hello', parts: [] });
  out = run('hello.world', 'alphachain');
  expect(out).toEqual({ type: 'alphachain', root: 'hello', parts: ['world'] });
  out = run(
    `hello
    .world
    .foo`,
    'alphachain'
  );
  expect(out).toEqual({
    type: 'alphachain',
    root: 'hello',
    parts: ['world', 'foo'],
  });
});

test('alias matches a keyword followed by a colon', () => {
  let out = run('test:', 'alias');
  expect(out).toBe('test');
  out = run('test  :', 'alias');
  expect(out).toBe('test');
});

test('param matches "$" followed by a sequence of digits', () => {
  let out = run('$1', 'param');
  expect(out).toEqual({
    type: 'param',
    index: 1,
  });
  out = run('$987654321', 'param');
  expect(out).toEqual({
    type: 'param',
    index: 987654321,
  });
});

test('opchar matches one of a specific set of characters', () => {
  const out = run('&', 'opchar');
  expect(out).toBe('&');
  expect(() => run('h', 'opchar')).toThrow();
});

test('transformarg should accept an expression, a shape, or a collection', () => {
  let out = run('$1', 'transformArg');
  expect(out).toEqual({
    type: 'param',
    index: 1,
  });

  out = run('{id: $2}', 'transformArg');
  expect(out).toEqual({
    type: 'shape',
    fields: [
      {
        type: 'field',
        alias: 'id',
        value: {
          type: 'param',
          index: 2,
        },
      },
    ],
  });

  // TODO: collection test
});

test('transformargs should accept a series of transform args separated by commas', () => {
  const out = run('$3 , {id: $2},foo', 'transformArgs');
  expect(out).toEqual([
    {
      type: 'param',
      index: 3,
    },
    {
      type: 'shape',
      fields: [
        {
          type: 'field',
          alias: 'id',
          value: {
            type: 'param',
            index: 2,
          },
        },
      ],
    },
    {
      type: 'alphachain',
      root: 'foo',
      parts: [],
    },
  ]);
});

test('transform should match an alphachain followed by parenthesised transformArgs', () => {
  const out = run(
    `namespace.function(
      $3,
      {id: $2},
      foo,
    )`,
    'transform'
  );
  expect(out).toEqual({
    type: 'transform',
    description: {
      type: 'alphachain',
      root: 'namespace',
      parts: ['function'],
    },
    args: [
      {
        type: 'param',
        index: 3,
      },
      {
        type: 'shape',
        fields: [
          {
            type: 'field',
            alias: 'id',
            value: {
              type: 'param',
              index: 2,
            },
          },
        ],
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
    ],
  });
});

test('transforms should match a series of transforms separated by "|"', () => {
  const out = run(
    `| namespace.function(
      $3,
      {id: $2},
      foo,
    ) | bar()`,
    'transforms'
  );
  expect(out).toEqual([
    {
      type: 'transform',
      description: {
        type: 'alphachain',
        root: 'namespace',
        parts: ['function'],
      },
      args: [
        {
          type: 'param',
          index: 3,
        },
        {
          type: 'shape',
          fields: [
            {
              type: 'field',
              alias: 'id',
              value: {
                type: 'param',
                index: 2,
              },
            },
          ],
        },
        {
          type: 'alphachain',
          root: 'foo',
          parts: [],
        },
      ],
    },
    {
      type: 'transform',
      description: {
        type: 'alphachain',
        root: 'bar',
        parts: [],
      },
      args: [],
    },
  ]);
});

test('collection should consist of "[base collection or model] [transforms] [shape]"', () => {
  const out = run('u: users | filter(u.id = $1) {name}', 'collection');
  expect(out).toEqual({
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

test('collectionlist should handle a comma-separated list of basic collections', () => {
  const out = run(
    `(
    u: users,
    o: orders
  )`,
    'collectionlist'
  );
  expect(out).toEqual([
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

test('shape should match a simple field in curly braces', () => {
  const out = run('{name}', 'shape');
  expect(out).toEqual({
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
  });
});

test('basic query', () => {
  const out = run(
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

test('complex query', () => {
  const out = run(
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

test('collectionWithShape should match a simple field in curly braces', () => {
  const out = run('{name: $1}', 'collectionWithShape');
  expect(out).toEqual({
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
