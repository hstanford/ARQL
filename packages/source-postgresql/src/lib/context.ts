import type { FromNode, JoinNode, ParameterNode, Sql } from 'sql-ts';
import { AliasableNodes } from './field';
import { Params, SubQuery, TableWithColumns } from './types';

export type SourceConfig = {
  transforms: Record<
    string,
    (
      modifier: string[],
      origin: SubQuery[],
      args: (AliasableNodes | ParameterNode)[],
      sql: Sql
    ) => SubQuery | JoinNode | FromNode
  >;
  functions: Record<
    string,
    (args: (AliasableNodes | ParameterNode)[], sql: Sql) => AliasableNodes
  >;
  operators: Record<
    string,
    (args: (AliasableNodes | ParameterNode)[], sql: Sql) => AliasableNodes
  >;
};

export interface SourceContext extends SourceConfig {
  models: Partial<Record<string, TableWithColumns>>;
  sql: Sql;
  params: Params;
}
