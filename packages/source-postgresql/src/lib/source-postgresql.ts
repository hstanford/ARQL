import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModelDef, DataSource, ModelDefType } from '@arql/models';
import { Dictionary } from '@arql/util';
import { Sql, TableWithColumns } from 'sql-ts';
import { buildCollection } from './collection';
import { SourceConfig, SourceContext } from './context';
import { buildTransform } from './transform';
import { Params, Query } from './types';
import pg from 'pg';

export function sourcePostgresql(): string {
  return 'source-postgresql';
}
export class PostgreSQL<M extends DataModelDef[]> extends DataSource {
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
      models: M;
      connectionVariables: Record<string, unknown>;
    }
  ) {
    super(config);
    this.connectionVariables = config.connectionVariables;
  }

  // connect to the database and create sql-ts table object that
  // correspond to the configured models
  override async init() {
    const sql = (this.sql = new Sql('postgres', this.connectionVariables));

    // really need HKT to type this better
    this.sqlModels = this.models.reduce((acc, m) => {
      const def = sql.define({
        name: m.name,
        columns: m.fields.map((f) => f.name),
      });
      acc[m.name] = def;
      return acc;
    }, {} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    this.pool = new pg.Pool(this.connectionVariables);
  }

  connectionVariables: Record<string, unknown>;
  sql?: Sql;
  sqlModels?: {
    [K in M[number] as K['name']]: TableWithColumns<ModelDefType<K>>;
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
      operators: this.operators,
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
