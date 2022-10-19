import { ContextualisedCollection } from './collection';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { barField, fooField, testModel, testSource } from './test_helpers';
import { ContextualisedParam } from './param';

describe('function', () => {
  it('can list the fields that constitute the function arguments with one field', () => {
    const fn = new ContextualisedFunction({
      name: 'equals',
      modifier: [],
      args: [
        fooField,
        new ContextualisedParam({
          index: 0,
        }),
      ],
    });

    expect(fn.constituentFields.map((cf) => cf.def)).toEqual([fooField.def]);
  });

  it('can list the fields that constitute the function with multiple fields', () => {
    const fn = new ContextualisedFunction({
      name: 'equals',
      modifier: [],
      args: [fooField, barField],
    });

    expect(fn.constituentFields.map((cf) => cf.def)).toEqual([
      fooField.def,
      barField.def,
    ]);
  });

  it('can list the fields that constitute the function with nested fields', () => {
    const field = new ContextualisedField({
      field: fooField,
      name: 'foo',
      origin: new ContextualisedCollection({
        origin: testModel,
        name: 'testtest',
      }),
    });
    const fn = new ContextualisedFunction({
      name: 'equals',
      modifier: [],
      args: [field, new ContextualisedParam({ index: 0 })],
    });

    expect(fn.constituentFields.map((cf) => cf.def)).toEqual([field.def]);
  });

  it('can list the sources that constitute the function with nested fields', () => {
    const field = new ContextualisedField({
      field: fooField,
      name: 'foo',
      origin: new ContextualisedCollection({
        origin: testModel,
        name: 'testtest',
      }),
    });
    const fn = new ContextualisedFunction({
      name: 'equals',
      modifier: [],
      args: [field, new ContextualisedParam({ index: 0 })],
    });

    expect(fn.sources).toEqual([testSource]);
  });

  it("won't list sources or constituent fields when there are no fields involved", () => {
    const fn = new ContextualisedFunction({
      name: 'equals',
      modifier: [],
      args: [
        new ContextualisedParam({ index: 0 }),
        new ContextualisedParam({ index: 1 }),
      ],
    });

    expect(fn.constituentFields).toEqual([]);
    expect(fn.sources).toEqual([]);
  });
});
