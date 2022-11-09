import { DataModel, DataSource } from '@arql/models';
import { dataTypes } from '@arql/types';
import { ContextualisedCollection } from './collection.js';
import { ContextualisedField } from './field.js';
import { ContextualiserState } from './util.js';

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
export const testSource = new TestSource({
  models: [
    {
      name: 'test',
      fields: [
        {
          name: 'foo',
          dataType: dataTypes.string,
          sourceDataType: 'string',
        },
        {
          name: 'bar',
          dataType: dataTypes.string,
          sourceDataType: 'string',
        },
      ],
    },
  ],
  functions: {},
  transforms: {},
});

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
    dataType: dataTypes.string,
  });

  const barField = new ContextualisedField({
    context,
    field: testModel.fields[1],
    name: 'bar',
    origin: testCollection,
    dataType: dataTypes.string,
  });

  return {
    testCollection,
    fooField,
    barField,
  };
}
