import {
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  ID,
  isId,
} from '@arql/contextualiser';
import { DataField } from '@arql/models';
import {
  AliasNode,
  ArrayCallNode,
  BinaryNode,
  CaseNode,
  CastNode,
  ColumnNode,
  FunctionCallNode,
  InNode,
  LiteralNode,
  NotInNode,
  ParameterNode,
  PostfixUnaryNode,
  PrefixUnaryNode,
  RowCallNode,
  SliceNode,
  TernaryNode,
} from 'sql-ts';
import { SourceContext } from './context';
import { Column, isColumn, Query } from './types';

export type AliasableNodes =
  | AliasNode
  | Column
  | ColumnNode
  | BinaryNode
  | PrefixUnaryNode
  | PostfixUnaryNode
  | ArrayCallNode
  | CaseNode
  | CastNode
  | FunctionCallNode
  | InNode
  | LiteralNode
  | NotInNode
  | Query
  | RowCallNode
  | SliceNode
  | TernaryNode;

export function buildFieldValue(
  field:
    | ID
    | DataField
    | ContextualisedParam
    | ContextualisedExpr
    | ContextualisedFunction,
  constituentFields: Record<ID, Column>,
  context: SourceContext
) {
  let out: AliasableNodes | ParameterNode | undefined;
  if (isId(field)) {
    out = constituentFields[field];
  } else if (field instanceof DataField) {
    const model = context.models[field.model.name];
    if (!model) {
      throw new Error(`Could not find model ${field.model.name}`);
    }
    out = model.columns.find((c) => c.name === field.name);
  } else if (field instanceof ContextualisedParam) {
    out = context.sql.parameter(context.params[field.index - 1]);
  } else if (field instanceof ContextualisedExpr) {
    out = context.operators[field.op](
      field.args.map((arg) => buildFieldValue(arg, constituentFields, context)),
      context.sql
    );
  } else if (field instanceof ContextualisedFunction) {
    out = context.functions[field.name](
      field.args.map((arg) => buildFieldValue(arg, constituentFields, context)),
      context.sql
    );
  }

  if (!out) {
    throw new Error('Could not resolve field');
  }
  return out;
}

// Each field could be built from one or more models
// really we want to pass in what each of the fields constituentFields maps to
export function buildField(
  field: ContextualisedField,
  constituentFields: Record<ID, Column>,
  context: SourceContext
) {
  let out: AliasableNodes | ParameterNode | AliasNode = buildFieldValue(
    field.field,
    constituentFields,
    context
  );

  if (out instanceof AliasNode) {
    throw new Error('Unexpected alias node');
  }

  //console.log(field, out.toQuery());
  if (field.name) {
    // typescript is weird about differentiating these
    // due to varying `this` values that the methods support
    if (isColumn(out)) {
      out = out.as(field.name);
    } else if (out instanceof ParameterNode) {
      out = new AliasNode(out, field.name);
    } else {
      out = out.as(field.name);
    }
  }

  return out;
}
