import {
  ContextualisedCollection,
  ContextualisedQuery,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModelDef, DataSource, ModelDefType } from '@arql/models';
import { Dictionary } from '@arql/util';
import { Sql, TableWithColumns } from 'sql-ts';
import { buildQuery } from './collection';
import { SourceContext } from './context';
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
    models: M,
    operators: SourceContext['operators'],
    transforms: SourceContext['transforms'],
    functions: SourceContext['functions']
  ) {
    super(models, operators, transforms, functions);
  }

  async init(models: M, connectionVariables: Record<string, unknown>) {
    const sql = (this.sql = new Sql('postgres', connectionVariables));
    // really need HKT to do this better
    this.sqlModels = models.reduce((acc, m) => {
      const def = sql.define<ModelDefType<typeof m>>({
        name: m.name,
        columns: m.fields.map((f) => f.name),
      });
      acc[m.name] = def;
      return acc;
    }, {} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    this.pool = new pg.Pool(connectionVariables);
  }

  sql?: Sql;
  sqlModels?: {
    [K in M[number] as K['name']]: TableWithColumns<ModelDefType<K>>;
  };
  pool?: pg.Pool;

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
      sqlQuery = buildQuery(query, context);
    } else if (query instanceof ContextualisedTransform) {
      sqlQuery = buildTransform(query, context);
    } else {
      throw new Error('Unrecognised query type');
    }

    return this.sql.select(sqlQuery.star()).from(sqlQuery);
  }

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
