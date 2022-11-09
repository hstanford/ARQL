import { Contextualiser } from './contextualiser';
import { testSource } from './test_helpers';
import { functions, transforms } from '@arql/stdlib-definitions';
import { EXPR } from '@arql/types';

describe('contextualiser', () => {
  it('should work', () => {
    const models = new Map(
      testSource.models.map((model) => [model.name, model])
    );
    const filter = transforms.find((t) => t.name === 'filter');
    const equals = functions.find((f) => f.name === 'equals');

    if (!filter || !equals) throw new Error('Stdlib implementations not found');

    const cxr = new Contextualiser({
      models,
      transforms: [filter],
      functions: [equals],
      opMap: new Map([
        [
          '=',
          {
            pattern: [EXPR, '=', EXPR],
            rank: 1,
            name: 'equals',
          },
        ],
      ]),
    });
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
        dataType: 'string',
        name: 'foo',
        sourceDataType: 'string',
      },
      name: 'foo',
      dataType: 'string',
      origin: {
        name: 'test',
      },
    };
    const contextualisedBar = {
      id: 4,
      field: {
        dataType: 'string',
        name: 'bar',
        sourceDataType: 'string',
      },
      name: 'bar',
      dataType: 'string',
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
            name: 'equals',
            modifier: [],
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
              dataType: 'string',
              name: 'foo',
              origin: {
                name: 'test',
              },
            },
            {
              field: contextualisedBar.id,
              id: 6,
              dataType: 'string',
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
            dataType: 'string',
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
            dataType: 'string',
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
          dataType: 'string',
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
