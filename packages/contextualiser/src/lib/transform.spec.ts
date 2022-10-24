import { ContextualisedField } from './field';
import { testObjects } from './test_helpers';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';
import { ContextualiserState } from './util';

describe('transform', () => {
  it('can get the available fields from the origin collection', () => {
    const context = new ContextualiserState();
    const { testCollection } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [],
      modifier: [],
      transform: {
        name: 'foo',
        type: 'transformdef',
        nArgs: 1,
      },
      origin: testCollection,
    });
    expect(transform.id).toBe(3);
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      {
        field: 4,
        id: 6,
        name: 'foo',
        origin: {
          name: 'foo',
        },
      },
      {
        field: 5,
        id: 7,
        name: 'bar',
        origin: {
          name: 'foo',
        },
      },
    ]);
  });

  it('can get available fields when shaped', () => {
    const context = new ContextualiserState();
    const { testCollection, fooField } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [],
      modifier: [],
      transform: {
        name: 'foo',
        type: 'transformdef',
        nArgs: 1,
      },
      origin: testCollection,
    });
    transform.shape = [
      new ContextualisedField({
        context,
        field: fooField.id,
        origin: transform,
        name: 'foo',
      }),
    ];
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      {
        field: 1,
        id: 4,
        name: 'foo',
        origin: {
          name: 'foo',
        },
      },
    ]);
  });

  it('can get fields mentioned in args as constituent fields', () => {
    const context = new ContextualiserState();
    const { testCollection } = testObjects(context);
    const transform = new ContextualisedTransform({
      context,
      args: [new ContextualisedParam({ index: 0 })],
      modifier: [],
      transform: {
        name: 'foo',
        type: 'transformdef',
        nArgs: 1,
      },
      origin: testCollection,
    });
    transform.args.push(testCollection.availableFields[0]?.id);
    expect(transform.constituentFields).toEqual([
      testCollection.availableFields[0]?.id,
    ]);
  });
});
