import {
  ContextualisedFieldValue,
  ContextualisedTransform,
} from '@arql/contextualiser';
import type { ParameterNode, Sql } from 'sql-ts';
import { AliasableNodes } from './field';
import { Column, Params, SubQuery, TableWithColumns } from './types';

export type TransformFn = (
  transform: ContextualisedTransform,
  origin: SubQuery[],
  args: (AliasableNodes | ParameterNode)[],
  consistuentFields: Record<number, Column>,
  context: SourceContext
) => SubQuery;

export type FunctionFn = (
  args: (AliasableNodes | ParameterNode)[],
  sql: Sql,
  contextualisedArgs: ContextualisedFieldValue[],
  modifier: string[]
) => AliasableNodes;

export type SourceConfig = {
  transforms: Record<string, TransformFn>;
  functions: Record<string, FunctionFn>;
};

export interface SourceContext extends SourceConfig {
  models: Partial<Record<string, TableWithColumns>>;
  sql: Sql;
  params: Params;
}
