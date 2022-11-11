import {
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  ID,
} from '@arql/contextualiser';
import { DataField } from '@arql/models';
import { SourceContext } from './context.js';

export function buildFieldValue(
  value: ContextualisedField['field'],
  context: SourceContext
): unknown {
  if (value instanceof DataField) {
    if (value.name === '_id') {
      return { $toString: '$' + value.name };
    }
    return '$' + value.name;
  } else if (value instanceof ContextualisedParam) {
    return { $literal: context.params[value.index - 1] };
  } else if (value instanceof ContextualisedFunction) {
    return context.functions[value.name](
      value.args.map((arg) => buildFieldValue(arg, context)),
      value.args,
      value.modifier
    );
  } else if (value instanceof ID) {
    return '$' + context.ids[value.id].name;
  } else {
    throw new Error('Unsupported field value');
  }
}

export function buildField(
  field: ContextualisedField,
  context: SourceContext
): [string, unknown] {
  context.ids[field.id] = field;
  return [field.name, buildFieldValue(field.field, context)];
}
