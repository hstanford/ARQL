import { DataModel, DataSource } from '@arql/models';

class TestSource extends DataSource {
  supportsExpressionFields = false;
  supportsExpressions = true;
  supportsFieldAliasing = true;
  supportsGraphFields = false;
  supportsQueryNarrowing = false;
  supportsRecursiveJoins = false;
  supportsShaping = false;
  supportsStaticDataInjection = false;
  supportsSubCollections = false;
  supportsSubExpressions = false;
  supportsSubscriptions = false;
  supportsParameters = true;
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
