import {
  combineRequirements,
  DataField,
  DataModel,
  Node,
  Requirements,
} from '@arql/models';
import { Field } from '@arql/parser';
import { NeverType, Type } from '@arql/types';
import { ContextualisedExpr, getExpression } from './expr';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import {
  constituentFields,
  ContextualisedOrigin,
  ContextualisedQuery,
  ContextualiserState,
  ID,
  isId,
  selectField,
} from './util';

/**
 * A field represents a key-value pair
 */
export interface ContextualisedFieldDef {
  /** an object tracking the state of the ast the field is part of */
  context: ContextualiserState;

  /** the key */
  name: string;

  /** the value */
  field:
    | DataField
    | ContextualisedParam
    | ContextualisedExpr
    | ContextualisedFunction
    | ID;

  /** the collection or transform this field can be accessed from */
  origin: ContextualisedOrigin;

  /** the data type for the collector */
  dataType: Type;

  /** the data type for the source */
  sourceDataType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedField extends ContextualisedFieldDef {}

export class ContextualisedField extends Node<ContextualisedFieldDef> {
  type = 'contextualised_field' as const;

  constructor(opts: ContextualisedFieldDef) {
    super(opts);
    this.id = this.context.items.length;
    this.context.items.push(this);

    if (this.field instanceof ContextualisedExpr) {
      this._requirements.flags.supportsExpressionFields = true;
    }
  }

  /** a number identifying this field */
  id: ID;

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields() {
    return constituentFields(this.field);
  }

  /** a serialisation getter for testing */
  get def(): unknown {
    return {
      id: this.id,
      name: this.name,
      field: isId(this.field) ? this.field : this.field.def,
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => ({ name: o.name }))
        : { name: this.origin.name },
    };
  }

  /**
   * Requirements that this field and the node it wraps
   * demand in order for it to be resolved by any particular source
   */
  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      isId(this.field)
        ? this.context.get(this.field).requirements
        : this.field.requirements
    );
  }
}

/**
 * Contextualises a field
 * @param field an object describing the field the query wants
 * @param model the collection we're acting within
 * @param context contains which models/collections are available at this level of the query
 * @returns a contextualised field
 */
export function getField(
  field: Field,
  model: ContextualisedQuery,
  context: ContextualiserState
): ContextualisedField {
  let contextualisedField: ContextualisedField;

  if (model.origin instanceof DataModel) {
    // if the field comes directly from a datamodel
    // only the raw fields should be exposed
    const dataField = model.origin.fields.find((f) => f.name === field.alias);
    if (!dataField) {
      throw new Error(`Could not find ${JSON.stringify(field)}`);
    }

    contextualisedField = selectField(dataField, model, context);
  } else {
    const newField = getExpression(field.value, model.origin, context);
    const origField = isId(newField) ? context.get(newField) : newField;
    const dataType =
      'dataType' in origField ? origField.dataType : new NeverType({});

    contextualisedField = new ContextualisedField({
      context,
      name: field.alias || '',
      field: newField,
      origin: model,
      dataType,
    });

    context.items.push(contextualisedField);

    if (field.alias) {
      model._requirements.flags.supportsFieldAliasing = true;
    }
  }

  return contextualisedField;
}
