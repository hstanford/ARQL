import { DataModel, DataSource } from '@arql/models';
import { ContextualisedCollection } from './collection';
import { ContextualisedField } from './field';
import { ContextualiserState } from './util';

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
  {},
  {}
);

export const testModel = testSource.models.find(
  (m) => m.name === 'test'
) as DataModel;

export function testObjects(context: ContextualiserState) {
  const testCollection = new ContextualisedCollection({
    context,
    name: 'test',
    origin: testModel,
  });

  const fooField = new ContextualisedField({
    context,
    field: testModel.fields[0],
    name: 'foo',
    origin: testCollection,
  });

  const barField = new ContextualisedField({
    context,
    field: testModel.fields[1],
    name: 'bar',
    origin: testCollection,
  });

  return {
    testCollection,
    fooField,
    barField,
  };
}
