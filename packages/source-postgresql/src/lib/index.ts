import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel, DataModelDef, DataSource } from '@arql/models';
import { Dictionary } from '@arql/util';
import { Sql, TableWithColumns } from 'sql-ts';
import { buildCollection } from './collection.js';
import { SourceConfig, SourceContext } from './context.js';
import { buildTransform } from './transform.js';
import { Params, Query } from './types.js';
import pg from 'pg';
import { readFile } from 'fs/promises';
import { fileURLToPath, URL } from 'url';
import { DataType, dataTypes } from '@arql/types';

export class PostgreSQL extends DataSource {
  supportsExpressionFields = true;
  supportsExpressions = true;
  supportsFieldAliasing = true;
  supportsGraphFields = true;
  supportsQueryNarrowing = true;
  supportsRecursiveJoins = false; // can do in theory
  supportsShaping = true;
  supportsStaticDataInjection = true;
  supportsSubCollections = true;
  supportsSubExpressions = true;
  supportsSubscriptions = false;
  supportsParameters = true;
  subCollectionDepth = Infinity;

  constructor(
    config: SourceConfig & {
      models: DataModelDef[];
      connectionVariables: Record<string, unknown>;
    }
  ) {
    super(config);
    this.connectionVariables = config.connectionVariables;
  }

  // connect to the database and create sql-ts table object that
  // correspond to the configured models
  override async init() {
    this.sql = new Sql('postgres', this.connectionVariables);

    this.pool = new pg.Pool(this.connectionVariables);

    if (!this.models.length) {
      await this.dumpModels();
    }
    this.setModels();
  }

  // produce model definitions from the structure of the connected database
  async dumpModels() {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const schema = await readFile(__dirname + '/data_schema.sql', {
      encoding: 'utf8',
    });
    const response = await this.pool?.query(schema);
    const data = response?.rows as {
      name: string;
      fields: {
        name: string;
        dataType: DataType;
        sourceDataType: string;
      }[];
    }[];
    if (!data) {
      throw new Error('Could not produce model schema');
    }
    this.models = data.map(
      (m) =>
        new DataModel(
          {
            name: m.name,
            fields: m.fields.map((f) => ({
              name: f.name,
              dataType: dataTypes[f.dataType],
              sourceDataType: f.sourceDataType,
            })),
          },
          this
        )
    );
    this.setModels();
  }

  setModels() {
    // really need HKT to type this better
    this.sqlModels = this.models.reduce((acc, m) => {
      const def = this.sql?.define({
        name: m.name,
        columns: m.fields.map((f) => f.name),
      });
      acc[m.name] = def;
      return acc;
    }, {} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  connectionVariables: Record<string, unknown>;
  sql?: Sql;
  sqlModels?: {
    [K in DataModelDef as K['name']]: TableWithColumns<unknown>;
  };
  pool?: pg.Pool;

  // build a sql-ts query object from a ContextualisedQuery
  buildQuery(query: ContextualisedQuery, params: Params) {
    if (!this.sql || !this.sqlModels) {
      throw new Error('Initialisation required');
    }
    const context: SourceContext = {
      models: this.sqlModels,
      params,
      sql: this.sql,
      transforms: this.transforms,
      functions: this.functions,
    };
    let sqlQuery: Query;
    if (query instanceof ContextualisedCollection) {
      sqlQuery = buildCollection(query, context);
    } else if (query instanceof ContextualisedTransform) {
      sqlQuery = buildTransform(query, context);
    } else {
      throw new Error('Unrecognised query type');
    }

    return this.sql.select(sqlQuery.star()).from(sqlQuery);
  }

  // build and execute a sql query against a postgres db
  async resolve(
    subquery: ContextualisedQuery,
    params: Params
  ): Promise<Dictionary<unknown>[]> {
    if (!this.pool) {
      throw new Error('Not initialised');
    }
    const query = this.buildQuery(subquery, params).toQuery();
    const result = await this.pool.query(query);
    return result.rows;
  }
}
