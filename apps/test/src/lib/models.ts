import { DataModel, DataSource } from '@arql/models';
import {
  ContextualisedCollection,
  ContextualisedField,
} from '@arql/contextualiser';

class TestSource extends DataSource {
  supportsExpressionFields = false;
  supportsExpressions = false;
  supportsFieldAliasing = false;
  supportsGraphFields = false;
  supportsQueryNarrowing = false;
  supportsRecursiveJoins = false;
  supportsShaping = false;
  supportsStaticDataInjection = false;
  supportsSubCollections = false;
  supportsSubExpressions = false;
  supportsSubscriptions = false;
  supportsParameters = false;
  subCollectionDepth = Infinity;
  async resolve() {
    return [];
  }
}
export const testSource = new TestSource(
  [
    {
      name: 'test',
      fields: [
        {
          name: 'foo',
          datatype: 'string',
        },
        {
          name: 'bar',
          datatype: 'string',
        },
      ],
    },
  ],
  {},
  {}
);

export const testModel = testSource.models.find(
  (m) => m.name === 'test'
) as DataModel;

export const testCollection = new ContextualisedCollection({
  name: 'test',
  origin: testModel,
});

export const fooField = new ContextualisedField({
  field: testModel.fields[0],
  name: 'foo',
  origin: testCollection,
});

export const barField = new ContextualisedField({
  field: testModel.fields[1],
  name: 'bar',
  origin: testCollection,
});
