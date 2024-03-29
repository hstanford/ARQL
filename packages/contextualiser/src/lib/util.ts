import { DataField, DataModel } from '@arql/models';
import { FunctionDef, RankedOperator, TransformDef } from '@arql/types';
import { ContextualisedCollection } from './collection.js';
import { ContextualisedField } from './field.js';
import { ContextualisedFunction } from './function.js';
import { ID } from './id.js';
import { ContextualisedParam } from './param.js';
import { ContextualisedTransform } from './transform.js';

export function isId(
  item: ContextualisedNodeType | DataField | ID
): item is ID {
  return item instanceof ID;
}

export type ContextualisedNodeType =
  | ContextualisedCollection
  | ContextualisedField
  | ContextualisedFunction
  | ContextualisedParam
  | ContextualisedTransform;

export type ContextualisedQuery =
  | ContextualisedCollection
  | ContextualisedTransform;

export type ContextualisedOrigin =
  | ContextualisedCollection
  | ContextualisedTransform
  | DataModel;

export interface ContextualiserConfig {
  models: Map<string, DataModel>;
  transforms: TransformDef[];
  functions: FunctionDef[];
  opMap: Map<string, RankedOperator>;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualiserState extends ContextualiserConfig {}
export class ContextualiserState {
  aliases: Map<string, ContextualisedOrigin> = new Map();
  items: ContextualisedNodeType[] = [];
  get(id: ID): ContextualisedNodeType {
    return this.items[id.id];
  }
  constructor(config: ContextualiserConfig) {
    Object.assign(this, config);
  }
}

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
    | ContextualisedFunction
    | ID
): ID[] {
  if (isId(item)) {
    return [item];
  }
  // propagate required fields down to the arguments
  const fields: ID[] = [];
  if (item instanceof ContextualisedParam) {
    // params have no field requirements
  } else if (item instanceof ContextualisedField) {
    fields.push(new ID({ id: item.id, dataType: item.dataType }));
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
  origin: ContextualisedQuery,
  context: ContextualiserState
) {
  return new ContextualisedField({
    context,
    name: field.name,
    origin,
    field:
      field instanceof ContextualisedField
        ? new ID({ id: field.id, dataType: field.dataType })
        : field,
    sourceDataType: field.sourceDataType,
    dataType: field.dataType,
  });
}
