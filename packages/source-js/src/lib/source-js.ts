import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModelDef, DataSource } from '@arql/models';
import { Dictionary } from '@arql/util';
import { resolveCollection } from './collection';
import { isResultMaps, Row, SourceConfig, SourceContext } from './context';
import { resolveTransform } from './transform';

export class JsSource<M extends DataModelDef[]> extends DataSource {
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

  constructor(config: SourceConfig & { models: M }) {
    super(config);
    this.data = config.data;
    this.dataModels = config.models.reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
    }, {} as Record<string, DataModelDef>);
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
