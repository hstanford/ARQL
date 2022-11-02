import {
  Query as BaseQuery,
  SubQuery as BaseSubQuery,
  Column as BaseColumn,
  TableWithColumns as BaseTableWithColumns,
} from 'sql-ts';

// type helpers to avoid writing <unknown> everywhere
export type Query = BaseQuery<unknown>;
export type SubQuery = BaseSubQuery<unknown, Record<string, unknown>>;
export type Column = BaseColumn<unknown>;
export type TableWithColumns = BaseTableWithColumns<unknown>;
export type Params = unknown[];

export function isColumn(obj: unknown): obj is Column {
  return obj instanceof BaseColumn;
}
