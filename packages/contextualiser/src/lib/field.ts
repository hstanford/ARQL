import {
  combineRequirements,
  DataField,
  DataModel,
  Node,
  Requirements,
} from '@arql/models';
import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';
import { constituentFields, ContextualiserState, ID } from './util';

/**
 * A field represents a key-value pair
 */
export interface ContextualisedFieldDef {
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
  origin: ContextualisedCollection | ContextualisedTransform | DataModel;

  additionalRequirements?: Requirements;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedField extends ContextualisedFieldDef {}
export class ContextualisedField extends Node<ContextualisedFieldDef> {
  type = 'contextualised_field' as const;

  constructor(opts: ContextualisedFieldDef) {
    super(opts);
    this.id = this.context.items.length;
    this.context.items.push(this);
  }

  id: ID;

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields() {
    return constituentFields(this.field);
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      id: this.id,
      name: this.name,
      field: typeof this.field === 'number' ? this.field : this.field.def,
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => ({ name: o.name }))
        : { name: this.origin.name },
    };
  }

  get requirements(): Requirements {
    if (typeof this.field === 'number') {
      return combineRequirements(
        this._requirements,
        this.context.get(this.field).requirements
      );
    }
    // TODO: move this somewhere more suitable?
    if (this.field.type === 'contextualised_expr') {
      this._requirements.flags.supportsExpressionFields = true;
    }
    return combineRequirements(this._requirements, this.field.requirements);
  }
}
