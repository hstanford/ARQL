import { dataTypes } from '@arql/types';
import { ContextualisedCollection } from './collection';
import { ContextualisedField } from './field';
import { testModel } from './test_helpers';
import { ContextualiserState } from './util';

const emptyConfig = {
  functions: [],
  transforms: [],
  models: new Map(),
  opMap: new Map(),
};

describe('collection', () => {
  it('should expose the available fields of data model', () => {
    const context = new ContextualiserState(emptyConfig);
    const coll = new ContextualisedCollection({
      context,
      name: 'alpha',
      origin: testModel,
    });

    expect(coll.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          dataType: 'string',
          sourceDataType: 'string',
          name: 'foo',
        },
        id: 1,
        name: 'foo',
        origin: {
          name: 'alpha',
        },
      },
      {
        field: {
          dataType: 'string',
          sourceDataType: 'string',
          name: 'bar',
        },
        id: 2,
        name: 'bar',
        origin: {
          name: 'alpha',
        },
      },
    ]);
  });

  it('should expose the available fields of a nested collection', () => {
    const context = new ContextualiserState(emptyConfig);
    const coll = new ContextualisedCollection({
      context,
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
      context,
      name: 'beta',
      origin: coll,
    });

    expect(coll2.availableFields.map((af) => af.def)).toEqual([
      {
        field: 2,
        id: 4,
        name: 'foo',
        origin: {
          name: 'beta',
        },
      },
      {
        field: 3,
        id: 5,
        name: 'bar',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });

  it('should propagate required changes down to nested collections', () => {
    const context = new ContextualiserState(emptyConfig);
    const coll = new ContextualisedCollection({
      context,
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
      context,
      name: 'beta',
      origin: coll,
    });

    const fooField = coll2.availableFields.find(
      (af) => af.name === 'foo'
    ) as ContextualisedField;
    coll2.applyRequiredFields([fooField]);

    expect(coll.requiredFields.map((af) => af.def)).toEqual([
      {
        field: {
          dataType: 'string',
          sourceDataType: 'string',
          name: 'foo',
        },
        id: 2,
        name: 'foo',
        origin: {
          name: 'alpha',
        },
      },
    ]);
    expect(coll2.requiredFields.map((af) => af.def)).toEqual([
      {
        field: 2,
        id: 4,
        name: 'foo',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });

  it('should respect selecting an aliased field', () => {
    const context = new ContextualiserState(emptyConfig);
    const coll = new ContextualisedCollection({
      context,
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
      context,
      name: 'beta',
      origin: coll,
    });

    // select one of the fields from the top-level collection's
    // origin's exposed fields
    const fooField = (
      coll2.origin.availableFields as ContextualisedField[]
    ).find((af) => af.name === 'foo') as ContextualisedField;
    coll2.shape = [
      new ContextualisedField({
        context,
        name: 'baz',
        origin: coll2,
        field: fooField.id,
        dataType: dataTypes.string,
      }),
    ];

    expect(coll2.availableFields.map((af) => af.def)).toEqual([
      {
        field: 2,
        id: 4,
        name: 'baz',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });
});
