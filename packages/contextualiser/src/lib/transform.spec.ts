import { ContextualisedField } from './field';
import { barField, fooField, testCollection } from './test_helpers';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';

describe('transform', () => {
  it('can get the available fields from the origin collection', () => {
    const transform = new ContextualisedTransform({
      args: [],
      modifier: [],
      name: 'foo',
      origin: testCollection,
    });
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      new ContextualisedField({
        field: fooField,
        origin: transform,
        name: 'foo',
      }).def,
      new ContextualisedField({
        field: barField,
        origin: transform,
        name: 'bar',
      }).def,
    ]);
  });

  it('can get available fields when shaped', () => {
    const transform = new ContextualisedTransform({
      args: [],
      modifier: [],
      name: 'foo',
      origin: testCollection,
    });
    transform.shape = [
      new ContextualisedField({
        field: fooField,
        origin: transform,
        name: 'foo',
      }),
    ];
    expect(transform.availableFields.map((af) => af.def)).toEqual([
      new ContextualisedField({
        field: fooField,
        origin: transform,
        name: 'foo',
      }).def,
    ]);
  });

  it('can get fields mentioned in args as constituent fields', () => {
    const transform = new ContextualisedTransform({
      args: [new ContextualisedParam({ index: 0 })],
      modifier: [],
      name: 'foo',
      origin: testCollection,
    });
    transform.args.push(
      new ContextualisedField({
        field: fooField,
        origin: transform,
        name: 'foo',
      })
    );
    expect(transform.constituentFields.map((af) => af.def)).toEqual([
      new ContextualisedField({
        field: fooField,
        origin: transform,
        name: 'foo',
      }).def,
    ]);
  });
});
