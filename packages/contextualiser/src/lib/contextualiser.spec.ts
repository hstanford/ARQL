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
      id: 3,
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
      id: 4,
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
      id: 9,
      name: 'test',
      origin: {
        args: [
          {
            args: [
              5,
              {
                index: 0,
              },
            ],
            op: 'equals',
          },
        ],
        modifier: [],
        name: 'filter',
        id: 2,
        origin: {
          id: 1,
          name: 'test',
          origin: {
            id: 0,
            name: 'test',
            origin: testModel,
            requiredFields: [contextualisedFoo, contextualisedBar],
            shape: undefined,
          },
          requiredFields: [
            {
              field: contextualisedFoo.id,
              id: 5,
              name: 'foo',
              origin: {
                name: 'test',
              },
            },
            {
              field: contextualisedBar.id,
              id: 6,
              name: 'bar',
              origin: {
                name: 'test',
              },
            },
          ],
          shape: undefined,
        },
        requiredFields: [
          {
            field: 6,
            id: 7,
            name: 'bar',
            origin: {
              name: 'filter',
            },
          },
        ],
        shape: [
          {
            id: 7,
            field: 6,
            name: 'bar',
            origin: {
              name: 'filter',
            },
          },
        ],
      },
      requiredFields: [
        {
          field: 7,
          id: 10,
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
