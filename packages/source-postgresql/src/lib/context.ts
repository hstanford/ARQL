import type { ParameterNode, Sql } from 'sql-ts';
import { AliasableNodes } from './field';
import { Params, SubQuery, TableWithColumns } from './types';

export type SourceContext = {
  models: Partial<Record<string, TableWithColumns>>;
  transforms: Record<
    string,
    (
      origin: SubQuery[],
      args: (AliasableNodes | ParameterNode)[],
      sql: Sql
    ) => SubQuery
  >;
  functions: Record<
    string,
    (args: (AliasableNodes | ParameterNode)[], sql: Sql) => AliasableNodes
  >;
  operators: Record<
    string,
    (args: (AliasableNodes | ParameterNode)[], sql: Sql) => AliasableNodes
  >;
  sql: Sql;
  params: Params;
};
