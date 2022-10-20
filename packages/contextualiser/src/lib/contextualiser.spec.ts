import { EXPR } from '@arql/operators';
import { Contextualiser } from './contextualiser';
import { testSource } from './test_helpers';

describe('contextualiser', () => {
  it('should work', () => {
    const models = new Map(
      testSource.models.map((model) => [model.name, model])
    );
    const filter = {
      type: 'transformdef' as const,
      name: 'filter',
      nArgs: 1,
    };

    const cxr = new Contextualiser(
      models,
      [filter],
      [],
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
    const contextualised = cxr.run({
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
                { parts: [], root: 'foo', type: 'alphachain' },
                { type: 'op', symbol: '=' },
                { index: 0, type: 'param' },
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

    const contextualisedFoo = {
      field: {
        datatype: 'string',
        name: 'foo',
      },
      name: 'foo',
      origin: {
        name: 'test',
      },
    };
    const contextualisedBar = {
      field: {
        datatype: 'string',
        name: 'bar',
      },
      name: 'bar',
      origin: {
        name: 'test',
      },
    };
    const testModel = testSource.models[0].def;
    expect(contextualised.def).toEqual({
      name: 'test',
      origin: {
        args: [
          {
            args: [
              contextualisedFoo,
              {
                index: 0,
              },
            ],
            op: 'equals',
          },
        ],
        modifier: [],
        name: 'filter',
        origin: {
          name: 'test',
          origin: testModel,
          requiredFields: [contextualisedFoo, contextualisedBar],
          shape: undefined,
        },
        requiredFields: [
          {
            field: contextualisedBar,
            name: 'bar',
            origin: {
              name: 'filter',
            },
          },
        ],
        shape: [
          {
            field: contextualisedBar,
            name: 'bar',
            origin: {
              name: 'filter',
            },
          },
        ],
      },
      requiredFields: [
        {
          field: {
            field: contextualisedBar,
            name: 'bar',
            origin: {
              name: 'filter',
            },
          },
          name: 'bar',
          origin: {
            name: 'test',
          },
        },
      ],
      shape: undefined,
    });
  });
});
