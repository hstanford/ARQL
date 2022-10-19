import {
  combineRequirements,
  DataField,
  DataModel,
  DataSource,
  Node,
  Requirements,
} from '@arql/models';
import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { ContextualisedTransform } from './transform';
import { constituentFields } from './util';

/**
 * A field represents a key-value pair
 */
export interface ContextualisedFieldDef {
  /** the key */
  name: string;
  /** the value */
  field:
    | DataField
    | ContextualisedField
    | ContextualisedParam
    | ContextualisedExpr
    | ContextualisedFunction;
  /** the collection or transform this field can be accessed from */
  origin: ContextualisedCollection | ContextualisedTransform | DataModel;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedField extends ContextualisedFieldDef {}
export class ContextualisedField extends Node<ContextualisedFieldDef> {
  type = 'contextualised_field' as const;
  propKeys = ['name', 'field', 'origin'] as const;

  /**
   * "sources" list the data sources required to satisfy all the commitments
   * this field has
   *
   * TODO: replace "sources" with "requirements"?
   */
  get sources(): DataSource[] {
    if (this.field instanceof DataField) {
      return [this.field.model.source];
    } else if (this.field instanceof ContextualisedField) {
      return this.field.sources;
    } else if (this.field instanceof ContextualisedParam) {
      return []; // TODO: perhaps a "requires parameterisation" special source
    } else if (this.field instanceof ContextualisedExpr) {
      return this.field.sources;
    } else if (this.field instanceof ContextualisedTransform) {
      return this.field.sources;
    } else {
      throw new Error(
        `Unexpected field type ${(this.field as { type: string })?.type}`
      );
    }
  }

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields() {
    // if it's a field directly got from the origin then it only
    // constitutes itself
    return constituentFields(this.field);
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      name: this.name,
      field: this.field.def,
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => ({ name: o.name }))
        : { name: this.origin.name },
    };
  }

  get requirements(): Requirements {
    // TODO: move this somewhere more suitable?
    if (this.field.type === 'exprtree') {
      this._requirements.flags.supportsExpressionFields = true;
    }
    return combineRequirements(this._requirements, this.field.requirements);
  }
}
