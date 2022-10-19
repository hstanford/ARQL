import { ContextualisedCollection } from './collection';
import { ContextualisedField } from './field';
import { testModel } from './test_helpers';

describe('collection', () => {
  it('should expose the available fields of data model', () => {
    const coll = new ContextualisedCollection({
      name: 'alpha',
      origin: testModel,
    });

    expect(coll.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          datatype: 'string',
          name: 'foo',
        },
        name: 'foo',
        origin: {
          name: 'alpha',
        },
      },
      {
        field: {
          datatype: 'string',
          name: 'bar',
        },
        name: 'bar',
        origin: {
          name: 'alpha',
        },
      },
    ]);
  });

  it('should expose the available fields of a nested collection', () => {
    const coll = new ContextualisedCollection({
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
      name: 'beta',
      origin: coll,
    });

    expect(coll2.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          field: {
            datatype: 'string',
            name: 'foo',
          },
          name: 'foo',
          origin: {
            name: 'alpha',
          },
        },
        name: 'foo',
        origin: {
          name: 'beta',
        },
      },
      {
        field: {
          field: {
            datatype: 'string',
            name: 'bar',
          },
          name: 'bar',
          origin: {
            name: 'alpha',
          },
        },
        name: 'bar',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });

  it('should propagate required changes down to nested collections', () => {
    const coll = new ContextualisedCollection({
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
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
          datatype: 'string',
          name: 'foo',
        },
        name: 'foo',
        origin: {
          name: 'alpha',
        },
      },
    ]);
    expect(coll2.requiredFields.map((af) => af.def)).toEqual([
      {
        field: {
          field: {
            datatype: 'string',
            name: 'foo',
          },
          name: 'foo',
          origin: {
            name: 'alpha',
          },
        },
        name: 'foo',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });

  it('should respect selecting an aliased field', () => {
    const coll = new ContextualisedCollection({
      name: 'alpha',
      origin: testModel,
    });
    const coll2 = new ContextualisedCollection({
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
        name: 'baz',
        origin: coll2,
        field: fooField,
      }),
    ];

    expect(coll2.availableFields.map((af) => af.def)).toEqual([
      {
        field: {
          field: {
            datatype: 'string',
            name: 'foo',
          },
          name: 'foo',
          origin: {
            name: 'alpha',
          },
        },
        name: 'baz',
        origin: {
          name: 'beta',
        },
      },
    ]);
  });
});
