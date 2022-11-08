import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel, DataModelDef, DataSource } from '@arql/models';
import { dataTypes, DataType } from '@arql/types';
import { Dictionary } from '@arql/util';
import { resolveCollection } from './collection';
import { isResultMaps, Row, SourceConfig, SourceContext } from './context';
import { resolveTransform } from './transform';

function dataTypeForValue(value: unknown): DataType {
  if (typeof value === 'string') {
    return 'string';
  } else if (typeof value === 'number') {
    return 'number';
  } else if (value instanceof Date) {
    return 'date';
  } else if (Array.isArray(value) || value?.constructor === Object) {
    return 'json';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else {
    throw new Error('Could not determine datatype');
  }
}

export class JsSource extends DataSource {
  supportsExpressionFields = true;
  supportsExpressions = true;
  supportsFieldAliasing = true;
  supportsGraphFields = true;
  supportsQueryNarrowing = true;
  supportsRecursiveJoins = false;
  supportsShaping = true;
  supportsStaticDataInjection = true;
  supportsSubCollections = true;
  supportsSubExpressions = true;
  supportsSubscriptions = false;
  supportsParameters = true;
  subCollectionDepth = Infinity;

  data: Map<string, Row[]>;
  dataModels: Record<string, DataModelDef>;

  constructor(config: SourceConfig & { models: DataModelDef[] }) {
    super(config);
    this.data = config.data;
    this.dataModels = this.getDataModels(config.models);
    if (!this.models.length) {
      this.dumpModels();
    }
  }

  getDataModels(models: DataModelDef[]) {
    return models.reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
    }, {} as Record<string, DataModelDef>);
  }

  dumpModels() {
    const models: DataModelDef[] = [];
    for (const [name, rows] of this.data.entries()) {
      if (!rows.length) continue;
      models.push({
        name,
        fields: Object.entries(rows[0]).map(([name, value]) => ({
          name,
          dataType: dataTypes[dataTypeForValue(value)],
          sourceDataType: dataTypeForValue(value),
        })),
      });
    }
    this.models = models.map((m) => new DataModel(m, this));
    this.dataModels = this.getDataModels(models);
  }

  // retrieve values from an in-memory js structure
  async resolve(
    subquery: ContextualisedQuery,
    params: unknown[]
  ): Promise<Dictionary<unknown>[]> {
    const context: SourceContext = {
      operators: this.operators,
      transforms: this.transforms,
      functions: this.functions,
      models: this.dataModels,
      data: this.data,
      params,
    };

    if (subquery instanceof ContextualisedCollection) {
      return await resolveCollection(subquery, context);
    } else if (subquery instanceof ContextualisedTransform) {
      const transform = await resolveTransform(subquery, context);
      if (isResultMaps(transform)) {
        // TODO: is this right?
        throw new Error(
          'Cannot produce ResultMaps from the top level of a source'
        );
      }
      return transform;
    } else {
      throw new Error('Unable to resolve delegated query');
    }
  }
}
