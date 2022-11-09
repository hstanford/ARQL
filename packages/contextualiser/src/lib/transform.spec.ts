import { ContextualisedField } from './field';
import { testObjects } from './test_helpers';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';
import { ContextualiserState } from './util';
import { array, dataTypes, TransformDef, unknown } from '@arql/types';

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
        field: 4,
        id: 6,
        dataType: 'string',
        name: 'foo',
        origin: {
          name: 'foo',
        },
      },
      {
        field: 5,
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
        field: fooField.id,
        origin: transform,
        name: 'foo',
        dataType: dataTypes.number,
      }),
    ];
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      {
        field: 1,
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
    transform.args.push(testCollection.availableFields[0]?.id);
    expect(transform.constituentFields).toEqual([
      testCollection.availableFields[0]?.id,
    ]);
  });
});
