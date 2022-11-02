import {
  combineRequirements,
  DataField,
  Node,
  Requirements,
} from '@arql/models';
import { ContextualisedExpr } from './expr';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import {
  constituentFields,
  ContextualisedOrigin,
  ContextualiserState,
  ID,
  isId,
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
