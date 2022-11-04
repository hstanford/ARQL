import { ContextualisedTransform, ID } from '@arql/contextualiser';
import type { ParameterNode, Sql } from 'sql-ts';
import { AliasableNodes } from './field';
import { Column, Params, SubQuery, TableWithColumns } from './types';

export type TransformFn = (
  transform: ContextualisedTransform,
  origin: SubQuery[],
  args: (AliasableNodes | ParameterNode)[],
  consistuentFields: Record<ID, Column>,
  context: SourceContext
) => SubQuery;

export type FunctionFn = (
  args: (AliasableNodes | ParameterNode)[],
  sql: Sql
) => AliasableNodes;

export type OperatorFn = (
  args: (AliasableNodes | ParameterNode)[],
  sql: Sql
) => AliasableNodes;

export type SourceConfig = {
  transforms: Record<string, TransformFn>;
  functions: Record<string, FunctionFn>;
  operators: Record<string, OperatorFn>;
};

export interface SourceContext extends SourceConfig {
  models: Partial<Record<string, TableWithColumns>>;
  sql: Sql;
  params: Params;
}
