import {
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  isId,
} from '@arql/contextualiser';
import { DataField } from '@arql/models';
import { CollectorContext, Row, ResultMap } from './context';

// resolve a field value from a record
// e.g. get `(id + foo)` from {id: 1, foo: 2} should resolve to 3
export function buildFieldValue(
  field: ContextualisedField['field'],
  record: Row | ResultMap,
  constituentFields: ContextualisedField[],
  context: CollectorContext
): unknown {
  if (isId(field)) {
    // identify the field on the record we're trying to access
    const underlyingField = constituentFields.find((f) => f.id === field);
    if (!underlyingField) {
      throw new Error('Could not find matching constituent field');
    }

    // in case we have multiple records in one (like from a join)
    // grab the correct sub-record
    let origin;
    if (record instanceof Map) {
      if (!underlyingField.origin.name) {
        throw new Error('Could not find underlying field origin');
      }
      origin = record.get(underlyingField.origin.name);
    } else {
      origin = record;
    }

    if (!origin) {
      throw new Error('Could not find underlying field origin');
    }

    return origin[underlyingField.name];
  } else if (field instanceof DataField) {
    throw new Error('DataField should be resolved by the underlying source');
  } else if (field instanceof ContextualisedParam) {
    // a parameter value will be retrieved directly from the parameter array
    return context.params[field.index - 1];
  } else if (field instanceof ContextualisedExpr) {
    // assert that the named operator exists
    const op = context.operators[field.op];
    if (!op) {
      throw new Error(`Unsupported operator ${field.op}`);
    }

    // recursively process expression arguments
    const args = field.args.map((arg) =>
      buildFieldValue(arg, record, constituentFields, context)
    );

    return op(args);
  } else if (field instanceof ContextualisedFunction) {
    // assert that the named function exists
    const fn = context.functions[field.name];
    if (!fn) {
      throw new Error(`Unsupported function ${field.name}`);
    }

    // recursively process function arguments
    const args = field.args.map((arg) =>
      buildFieldValue(arg, record, constituentFields, context)
    );

    return fn(args, field.modifier);
  } else {
    throw new Error('Unexpected field value');
  }
}
