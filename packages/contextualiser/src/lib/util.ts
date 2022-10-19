import { DataField } from '@arql/models';
import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';

/**
 * lists all the core data fields that originate elsewhere
 * @param item a complex field type
 * @returns the contexualised fields that produce the complex field
 */
export function constituentFields(
  item:
    | DataField
    | ContextualisedField
    | ContextualisedParam
    | ContextualisedExpr
    | ContextualisedFunction
): ContextualisedField[] {
  // propagate required fields down to the arguments
  const fields: ContextualisedField[] = [];
  if (item instanceof ContextualisedExpr) {
    fields.push(...item.constituentFields);
  } else if (item instanceof ContextualisedParam) {
    // params have no field requirements
  } else if (item instanceof ContextualisedField) {
    fields.push(item);
  } else if (item instanceof ContextualisedFunction) {
    fields.push(...item.constituentFields);
  } else if (item instanceof DataField) {
    // data fields have no field requirements
  } else {
    throw new Error(
      `Unable to get constituent fields for ${(item as { type: string })?.type}`
    );
  }
  return fields;
}

/**
 * Wraps a field from a nested collection to be available from the parent
 * @param field a field within a sub-collection or model
 * @param origin the collection the field will be available from
 * @returns a new contextualised field
 */
export function selectField(
  field: ContextualisedField | DataField,
  origin: ContextualisedCollection | ContextualisedTransform
) {
  return new ContextualisedField({
    name: field.name,
    origin,
    field,
  });
}
