import { Collection, Db, MongoClient, Document } from 'mongodb';
import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel, DataModelDef, DataSource } from '@arql/models';
import { DataType, PrimitiveType } from '@arql/types';
import { Dictionary } from '@arql/util';
import { QueryDetails, SourceConfig, SourceContext } from './context.js';
import { buildCollection } from './collection.js';
import { buildTransform } from './transform.js';

export class MongoDb extends DataSource {
  supportsExpressionFields = true;
  supportsExpressions = true;
  supportsFieldAliasing = true;
  // TODO: looks like support sort of exists with things like $lookup
  supportsGraphFields = false;
  supportsQueryNarrowing = true;
  supportsRecursiveJoins = false;
  supportsShaping = true;
  supportsStaticDataInjection = false;
  supportsSubCollections = true;
  supportsSubExpressions = true;
  supportsSubscriptions = false;
  supportsParameters = true;
  subCollectionDepth = 2;

  constructor(
    config: SourceConfig & {
      models: DataModelDef[];
      connectionUri: string;
      db: string;
    }
  ) {
    super(config);
    this.client = new MongoClient(config.connectionUri);
    this.dbName = config.db;
  }

  client: MongoClient;
  dbName: string;
  db?: Db;
  mongoModels: {
    [K in string]: Collection<Document>;
  } = {};

  override async init() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.setModels();
    if (!this.models.length) {
      await this.dumpModels();
    }
  }

  setModels() {
    const db = this.db;
    if (!db) {
      throw new Error('Not initialised');
    }
    this.mongoModels = this.models.reduce(
      (acc, model) => {
        acc[model.name] = db.collection(model.name);
        return acc;
      },
      {} as {
        [K in string]: Collection<Document>;
      }
    );
  }

  async dumpModels() {
    if (!this.db) {
      throw new Error('Not initialised');
    }

    const models: DataModelDef[] = [];

    const collections = await this.db.collections();
    for (const collection of collections) {
      const item = await collection.findOne();
      if (!item) {
        continue;
      }
      const modelDef: DataModelDef = {
        name: collection.collectionName,
        fields: Object.entries(item).map(([key, value]) => {
          const type = key === '_id' ? 'string' : typeof value;
          if (!['string', 'number', 'boolean'].includes(type)) {
            throw new Error(`Unsupported data type ${type}`);
          }
          return {
            name: key,
            dataType: new PrimitiveType({
              name: type as unknown as DataType,
            }),
            sourceDataType: type,
          };
        }),
      };

      models.push(modelDef);
    }
    this.models = models.map((model) => new DataModel(model, this));
    this.setModels();
  }

  buildQuery(subquery: ContextualisedQuery, params: unknown[]): QueryDetails {
    const context: SourceContext = {
      functions: this.functions,
      models: this.mongoModels,
      params,
      transforms: this.transforms,
      ids: {},
    };
    const queryDetails: QueryDetails = {
      query: [],
    };

    if (subquery instanceof ContextualisedCollection) {
      buildCollection(subquery, queryDetails, context);
    } else if (subquery instanceof ContextualisedTransform) {
      buildTransform(subquery, queryDetails, context);
    } else {
      throw new Error('Unsupported query type');
    }

    return queryDetails;
  }

  async resolve(
    subquery: ContextualisedQuery,
    params: unknown[]
  ): Promise<Dictionary<unknown>[]> {
    if (!this.db) {
      throw new Error('Not initialised');
    }

    const { collection, query } = this.buildQuery(subquery, params);
    if (!collection) {
      throw new Error('Could not find collection to query over');
    }
    const result = await collection.aggregate(query).toArray();
    return result;
  }
}
