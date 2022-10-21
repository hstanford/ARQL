import { assertNoError } from './test_helpers';
import {
  transform,
  transformArg,
  transformArgs,
  transforms,
} from './transform';

describe('transformarg', () => {
  it('should accept an expression', () => {
    const out = transformArg.run('$1');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'param',
      index: 1,
    });
  });

  it('should accept a shape', () => {
    const out = transformArg.run('{id: $2}');
    assertNoError(out);
    expect(out.result).toEqual({
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
  });

  // TODO: collection test
});

describe('transformargs', () => {
  it('should accept a series of transform args separated by commas', () => {
    const out = transformArgs.run('$3 , {id: $2},foo');
    assertNoError(out);
    expect(out.result).toEqual([
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
});

describe('transform', () => {
  it('should match an alphachain followed by parenthesised transformArgs', () => {
    const out = transform.run(
      `namespace.function(
      $3,
      {id: $2},
      foo,
    )`
    );
    assertNoError(out);
    expect(out.result).toEqual({
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
});

describe('transforms', () => {
  it('should match a series of transforms separated by "|"', () => {
    const out = transforms.run(
      `| namespace.function(
      $3,
      {id: $2},
      foo,
    ) | bar()`
    );
    assertNoError(out);
    expect(out.result).toEqual([
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
});
