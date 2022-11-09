import { ContextualisedField } from './field.js';
import { testObjects } from './test_helpers.js';
import { ContextualisedParam } from './param.js';
import { ContextualisedTransform } from './transform.js';
import { ContextualiserState } from './util.js';
import { array, dataTypes, TransformDef, unknown } from '@arql/types';
import { ID } from './id.js';

const emptyConfig = {
  functions: [],
  transforms: [],
  models: new Map(),
  opMap: new Map(),
};

const fooTransform: TransformDef = {
  name: 'foo',
  signature: {
    args: array(unknown),
  },
};

describe('transform', () => {
  it('can get the available fields from the origin collection', () => {
    const context = new ContextualiserState(emptyConfig);
    const { testCollection } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [],
      modifier: [],
      transform: fooTransform,
      origin: testCollection,
    });
    expect(transform.id).toBe(3);
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          id: 4,
          dataType: 'string',
        },
        id: 6,
        dataType: 'string',
        name: 'foo',
        origin: {
          name: 'foo',
        },
      },
      {
        field: {
          id: 5,
          dataType: 'string',
        },
        id: 7,
        dataType: 'string',
        name: 'bar',
        origin: {
          name: 'foo',
        },
      },
    ]);
  });

  it('can get available fields when shaped', () => {
    const context = new ContextualiserState(emptyConfig);
    const { testCollection, fooField } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [],
      modifier: [],
      transform: fooTransform,
      origin: testCollection,
    });
    transform.shape = [
      new ContextualisedField({
        context,
        field: new ID({ id: fooField.id, dataType: fooField.dataType }),
        origin: transform,
        name: 'foo',
        dataType: dataTypes.number,
      }),
    ];
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          id: 1,
          dataType: 'string',
        },
        id: 4,
        dataType: 'number',
        name: 'foo',
        origin: {
          name: 'foo',
        },
      },
    ]);
  });

  it('can get fields mentioned in args as constituent fields', () => {
    const context = new ContextualiserState(emptyConfig);
    const { testCollection } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [new ContextualisedParam({ index: 0 })],
      modifier: [],
      transform: fooTransform,
      origin: testCollection,
    });
    const field = testCollection.availableFields[0];
    transform.args.push(new ID({ id: field.id, dataType: field.dataType }));
    expect(transform.constituentFields.map((f) => f.def)).toEqual([
      {
        id: testCollection.availableFields[0]?.id,
        dataType: 'string',
      },
    ]);
  });
});
