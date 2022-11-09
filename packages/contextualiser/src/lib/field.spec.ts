import { functions } from '@arql/stdlib-definitions';
import { dataTypes } from '@arql/types';
import { ContextualisedCollection } from './collection.js';
import { ContextualisedField } from './field.js';
import { ContextualisedFunction } from './function.js';
import { ID } from './id.js';
import { testObjects, testSource } from './test_helpers.js';
import { ContextualiserState } from './util.js';

const emptyConfig = {
  functions: [],
  transforms: [],
  models: new Map(),
  opMap: new Map(),
};

describe('field', () => {
  it('can list the source for a basic field', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    expect(fooField.requirements.sources).toEqual([testSource]);
  });

  it('can list the source for a nested field', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField, testCollection } = testObjects(context);
    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: new ID({ id: fooField.id, dataType: fooField.dataType }),
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
      dataType: dataTypes.number,
    });
    expect(wrappedField.requirements.sources).toEqual([testSource]);
  });

  it("won't list any constituent fields for a basic wrapped data field", () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    expect(fooField.constituentFields).toEqual([]);
  });

  it('can list the constituent fields for a nested field', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField, testCollection } = testObjects(context);
    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: new ID({ id: fooField.id, dataType: fooField.dataType }),
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
      dataType: dataTypes.number,
    });
    expect(wrappedField.constituentFields.map((f) => f.def)).toEqual([
      {
        id: fooField.id,
        dataType: 'string',
      },
    ]);
  });

  it('can list the constituent fields for a field wrapping an expression', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField, barField, testCollection } = testObjects(context);

    const equals = functions.find((f) => f.name === 'equals');
    if (!equals) throw new Error('Missing function definition for "equals"');

    const wrappedField = new ContextualisedField({
      context,
      name: 'wrapped',
      field: new ContextualisedFunction({
        context,
        function: equals,
        args: [
          new ID({ id: fooField.id, dataType: fooField.dataType }),
          new ID({ id: barField.id, dataType: barField.dataType }),
        ],
        modifier: [],
        dataType: dataTypes.boolean,
      }),
      origin: new ContextualisedCollection({
        context,
        name: 'other',
        origin: testCollection,
      }),
      dataType: dataTypes.boolean,
    });
    expect(wrappedField.constituentFields.map((f) => f.def)).toEqual([
      { id: fooField.id, dataType: 'string' },
      { id: barField.id, dataType: 'string' },
    ]);
  });
});
