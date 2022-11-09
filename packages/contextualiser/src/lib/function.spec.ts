import { ContextualisedCollection } from './collection.js';
import { ContextualisedField } from './field.js';
import { ContextualisedFunction } from './function.js';
import { testObjects, testModel, testSource } from './test_helpers.js';
import { ContextualisedParam } from './param.js';
import { ContextualiserState } from './util.js';
import { functions } from '@arql/stdlib-definitions';
import { dataTypes } from '@arql/types';

const emptyConfig = {
  functions: [],
  transforms: [],
  models: new Map(),
  opMap: new Map(),
};

const equals = functions.find((fn) => fn.name === 'equals');
if (!equals) throw new Error('Missing equals fn');

describe('function', () => {
  it('can list the fields that constitute the function arguments with one field', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    const fn = new ContextualisedFunction({
      context,
      function: equals,
      modifier: [],
      args: [
        fooField.id,
        new ContextualisedParam({
          index: 0,
        }),
      ],
      dataType: dataTypes.boolean,
    });

    expect(fn.constituentFields).toEqual([fooField.id]);
  });

  it('can list the fields that constitute the function with multiple fields', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField, barField } = testObjects(context);

    const fn = new ContextualisedFunction({
      context,
      function: equals,
      modifier: [],
      args: [fooField.id, barField.id],
      dataType: dataTypes.boolean,
    });

    expect(fn.constituentFields).toEqual([fooField.id, barField.id]);
  });

  it('can list the fields that constitute the function with nested fields', () => {
    const context = new ContextualiserState(emptyConfig);
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
      dataType: dataTypes.number,
    });
    const fn = new ContextualisedFunction({
      context,
      function: equals,
      modifier: [],
      args: [field.id, new ContextualisedParam({ index: 0 })],
      dataType: dataTypes.boolean,
    });

    expect(fn.constituentFields).toEqual([field.id]);
  });

  it('can list the sources that constitute the function with nested fields', () => {
    const context = new ContextualiserState(emptyConfig);
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
      dataType: dataTypes.number,
    });
    const fn = new ContextualisedFunction({
      context,
      function: equals,
      modifier: [],
      args: [field.id, new ContextualisedParam({ index: 0 })],
      dataType: dataTypes.boolean,
    });

    expect(fn.requirements.sources).toEqual([testSource]);
  });

  it("won't list sources or constituent fields when there are no fields involved", () => {
    const context = new ContextualiserState(emptyConfig);
    const fn = new ContextualisedFunction({
      context,
      function: equals,
      modifier: [],
      args: [
        new ContextualisedParam({ index: 0 }),
        new ContextualisedParam({ index: 1 }),
      ],
      dataType: dataTypes.boolean,
    });

    expect(fn.constituentFields).toEqual([]);
    expect(fn.requirements.sources).toEqual([]);
  });
});
