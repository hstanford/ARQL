import {
  ContextualisedField,
  ContextualisedFieldValue,
  ContextualisedFunction,
  ContextualisedParam,
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
import { SourceContext } from './context.js';
import { Column, isColumn, Query } from './types.js';

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

// convert a contextualised field value to the sql-ts equivalent
export function buildFieldValue(
  field: ContextualisedFieldValue,
  constituentFields: Record<number, Column>,
  context: SourceContext
) {
  let out: AliasableNodes | ParameterNode | undefined;
  if (isId(field)) {
    // if it just references an underlying field directly, grab that field
    out = constituentFields[field.id];
  } else if (field instanceof DataField) {
    // if it's a DataField, grab the column with the same name as the field
    const model = context.models[field.model.name];
    if (!model) {
      throw new Error(`Could not find model ${field.model.name}`);
    }

    out = model.columns.find((c) => c.name === field.name);
  } else if (field instanceof ContextualisedParam) {
    // parameters go from $1 upwards so we need to -1 to get the correct param
    const value = context.params[field.index - 1];
    const type = (
      { string: 'TEXT', number: 'NUMERIC' } as Record<
        string,
        string | undefined
      >
    )[typeof value];
    out = context.sql.parameter(value);
    if (type) {
      out = context.sql.binaryOperator('::')(out, context.sql.literal(type));
    }
  } else if (field instanceof ContextualisedFunction) {
    const fn = context.functions[field.name];
    if (!fn) {
      throw new Error(`Could not find function ${field.name}`);
    }

    // recursively build sql-ts nodes for the function arguments
    out = fn(
      field.args.map((arg) => buildFieldValue(arg, constituentFields, context)),
      context.sql,
      field.args,
      field.modifier
    );
  }

  if (!out) {
    throw new Error('Could not resolve field');
  }
  return out;
}

// convert a contextualisedField to the sql-ts equivalent
export function buildField(
  field: ContextualisedField,
  constituentFields: Record<number, Column>,
  context: SourceContext
) {
  // get the underlying value
  let out: AliasableNodes | ParameterNode | AliasNode = buildFieldValue(
    field.field,
    constituentFields,
    context
  );

  if (out instanceof AliasNode) {
    throw new Error('Unexpected alias node');
  }

  // alias the field if possible
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
