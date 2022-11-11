import {
  ContextualisedField,
  ContextualisedFieldValue,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { Collection, Document } from 'mongodb';

type SubQuery = unknown;
type Arg = unknown;
type ExprNode = unknown;

export type TransformFn = (
  transform: ContextualisedTransform,
  query: QueryDetails,
  args: Arg[],
  contextualisedArgs: ContextualisedFieldValue[],
  modifier: string[],
  context: SourceContext
) => SubQuery;

export type FunctionFn = (
  args: Arg[],
  contextualisedArgs: ContextualisedFieldValue[],
  modifier: string[]
) => ExprNode;

export type SourceConfig = {
  transforms: Record<string, TransformFn>;
  functions: Record<string, FunctionFn>;
};

export interface SourceContext extends SourceConfig {
  models: Partial<Record<string, Collection>>;
  params: unknown[];
  ids: Record<number, ContextualisedField>;
}

export interface QueryDetails {
  collection?: Collection;
  query: Document[];
}
