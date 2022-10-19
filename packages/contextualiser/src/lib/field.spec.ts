import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { barField, fooField, testCollection, testSource } from './test_helpers';

describe('field', () => {
  it('can list the source for a basic field', () => {
    expect(fooField.sources).toEqual([testSource]);
  });

  it('can list the source for a nested field', () => {
    const wrappedField = new ContextualisedField({
      name: 'wrapped',
      field: fooField,
      origin: new ContextualisedCollection({
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.sources).toEqual([testSource]);
  });

  it("won't list any constituent fields for a basic wrapped data field", () => {
    expect(fooField.constituentFields).toEqual([]);
  });

  it('can list the constituent fields for a nested field', () => {
    const wrappedField = new ContextualisedField({
      name: 'wrapped',
      field: fooField,
      origin: new ContextualisedCollection({
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.constituentFields).toEqual([fooField]);
  });

  it('can list the constituent fields for a field wrapping an expression', () => {
    const wrappedField = new ContextualisedField({
      name: 'wrapped',
      field: new ContextualisedExpr({
        op: 'equals',
        args: [fooField, barField],
      }),
      origin: new ContextualisedCollection({
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.constituentFields).toEqual([fooField, barField]);
  });
});
