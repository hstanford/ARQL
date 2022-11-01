import {
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  isId,
} from '@arql/contextualiser';
import { DataField } from '@arql/models';
import { CollectorContext, Result, ResultMap } from './context';

export function buildFieldValue(
  field: ContextualisedField['field'],
  record: Result | ResultMap,
  constituentFields: ContextualisedField[],
  context: CollectorContext
): unknown {
  if (isId(field)) {
    const underlyingField = constituentFields.find((f) => f.id === field);
    if (!underlyingField) {
      throw new Error('Could not find matching constituent field');
    }
    if (record instanceof Map) {
      if (!underlyingField.origin.name) {
        throw new Error('Could not find underlying field origin');
      }
      const origin = record.get(underlyingField.origin.name);
      if (!origin) {
        throw new Error('Could not find underlying field origin');
      }
      return origin[underlyingField.name];
    } else {
      return record[underlyingField.name];
    }
  } else if (field instanceof DataField) {
    throw new Error('DataField should be resolved by the underlying source');
  } else if (field instanceof ContextualisedParam) {
    return context.params[field.index];
  } else if (field instanceof ContextualisedExpr) {
    return context.operators[field.op](
      field.args.map((arg) =>
        buildFieldValue(arg, record, constituentFields, context)
      )
    );
  } else if (field instanceof ContextualisedFunction) {
    return context.functions[field.name](
      field.args.map((arg) =>
        buildFieldValue(arg, record, constituentFields, context)
      )
    );
  } else {
    throw new Error('Unexpected field value');
  }
}
