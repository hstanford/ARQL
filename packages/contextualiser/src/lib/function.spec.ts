import { ContextualisedCollection } from './collection';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { testObjects, testModel, testSource } from './test_helpers';
import { ContextualisedParam } from './param';
import { ContextualiserState } from './util';

describe('function', () => {
  it('can list the fields that constitute the function arguments with one field', () => {
    const context = new ContextualiserState();
    const { fooField } = testObjects(context);
    const fn = new ContextualisedFunction({
      context,
      function: {
        name: 'equals',
        nArgs: 2,
      },
      modifier: [],
      args: [
        fooField.id,
        new ContextualisedParam({
          index: 0,
        }),
      ],
    });

    expect(fn.constituentFields).toEqual([fooField.id]);
  });

  it('can list the fields that constitute the function with multiple fields', () => {
    const context = new ContextualiserState();
    const { fooField, barField } = testObjects(context);

    const fn = new ContextualisedFunction({
      context,
      function: {
        name: 'equals',
        nArgs: 2,
      },
      modifier: [],
      args: [fooField.id, barField.id],
    });

    expect(fn.constituentFields).toEqual([fooField.id, barField.id]);
  });

  it('can list the fields that constitute the function with nested fields', () => {
    const context = new ContextualiserState();
    const { fooField } = testObjects(context);
    const field = new ContextualisedField({
      context,
      field: fooField.id,
      name: 'foo',
      origin: new ContextualisedCollection({
        context,
        origin: testModel,
        name: 'testtest',
      }),
    });
    const fn = new ContextualisedFunction({
      context,
      function: {
        name: 'equals',
        nArgs: 2,
      },
      modifier: [],
      args: [field.id, new ContextualisedParam({ index: 0 })],
    });

    expect(fn.constituentFields).toEqual([field.id]);
  });

  it('can list the sources that constitute the function with nested fields', () => {
    const context = new ContextualiserState();
    const { fooField } = testObjects(context);
    const field = new ContextualisedField({
      context,
      field: fooField.id,
      name: 'foo',
      origin: new ContextualisedCollection({
        context,
        origin: testModel,
        name: 'testtest',
      }),
    });
    const fn = new ContextualisedFunction({
      context,
      function: {
        name: 'equals',
        nArgs: 2,
      },
      modifier: [],
      args: [field.id, new ContextualisedParam({ index: 0 })],
    });

    expect(fn.requirements.sources).toEqual([testSource]);
  });

  it("won't list sources or constituent fields when there are no fields involved", () => {
    const context = new ContextualiserState();
    const fn = new ContextualisedFunction({
      context,
      function: {
        name: 'equals',
        nArgs: 2,
      },
      modifier: [],
      args: [
        new ContextualisedParam({ index: 0 }),
        new ContextualisedParam({ index: 1 }),
      ],
    });

    expect(fn.constituentFields).toEqual([]);
    expect(fn.requirements.sources).toEqual([]);
  });
});
