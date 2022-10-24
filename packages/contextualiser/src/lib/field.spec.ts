import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { testObjects, testSource } from './test_helpers';
import { ContextualiserState } from './util';

describe('field', () => {
  it('can list the source for a basic field', () => {
    const context = new ContextualiserState();
    const { fooField } = testObjects(context);
    expect(fooField.requirements.sources).toEqual([testSource]);
  });

  it('can list the source for a nested field', () => {
    const context = new ContextualiserState();
    const { fooField, testCollection } = testObjects(context);
    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: fooField.id,
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.requirements.sources).toEqual([testSource]);
  });

  it("won't list any constituent fields for a basic wrapped data field", () => {
    const context = new ContextualiserState();
    const { fooField } = testObjects(context);
    expect(fooField.constituentFields).toEqual([]);
  });

  it('can list the constituent fields for a nested field', () => {
    const context = new ContextualiserState();
    const { fooField, testCollection } = testObjects(context);
    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: fooField.id,
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.constituentFields).toEqual([fooField.id]);
  });

  it('can list the constituent fields for a field wrapping an expression', () => {
    const context = new ContextualiserState();
    const { fooField, barField, testCollection } = testObjects(context);
    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: new ContextualisedExpr({
        context,
        op: 'equals',
        args: [fooField.id, barField.id],
      }),
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
    });
    expect(wrappedField.constituentFields).toEqual([fooField.id, barField.id]);
  });
});
