import {
  combineRequirements,
  DataSource,
  Node,
  Requirements,
} from '@arql/models';
import { uniq } from '@arql/util';
import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { ContextualisedFunction } from './function';
import { ContextualisedParam } from './param';
import { constituentFields, selectField } from './util';

/**
 * Transforms represent functions that act on entire collections.
 * examples might include `filter` and `union`
 */
export interface ContextualisedTransformDef {
  name: string;
  modifier: string[];
  args: (
    | ContextualisedField
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
  )[];
  origin:
    | ContextualisedCollection
    | ContextualisedTransform
    | (ContextualisedCollection | ContextualisedTransform)[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedTransform extends ContextualisedTransformDef {}
export class ContextualisedTransform extends Node<ContextualisedTransformDef> {
  type = 'contextualised_transform' as const;
  propKeys = [
    'name',
    'modifier',
    'args',
    'origin',
    'sources',
    'requiredFields',
    'shape',
  ] as const;

  /**
   * "shape" is the override external interface to the collection
   */
  shape?: ContextualisedField[] = undefined;

  /**
   * "requiredFields" have to be resolved in order to satisfy the root of the query
   * These should be a subset of the union of "availableFields" and "shape"
   */
  requiredFields: ContextualisedField[] = [];

  /**
   * "Available fields" provide the fields that make up the external interface
   * of the transform. Other collections that originate from this transform
   * can reference and use these fields.
   */
  get availableFields(): ContextualisedField[] {
    return uniq(
      this.shape ||
        [this.origin]
          .flat()
          .map((o) => o.availableFields.map((f) => selectField(f, this)))
          .flat()
    );
  }

  /**
   * "sources" list the data sources required to satisfy all the commitments
   * this transform has
   */
  get sources(): DataSource[] {
    return uniq(
      this.requiredFields
        .map((f) => f.sources)
        .flat()
        .concat(this.constituentFields.map((f) => f.sources).flat())
    );
  }

  /**
   * "applyRequiredFields" adds the "fields" passed to the method as required fields
   * and propagates the requirements down to the collection's origin
   */
  applyRequiredFields(fields: ContextualisedField[]) {
    this.requiredFields = uniq(this.requiredFields.concat(fields));

    let requiredSubfields: ContextualisedField[] = [];
    for (const field of this.requiredFields) {
      requiredSubfields.push(...field.constituentFields);
    }
    requiredSubfields.push(...this.constituentFields);
    requiredSubfields = uniq(requiredSubfields);

    // TODO: can we just pass requiredSubfields through as requiredFields?
    [this.origin].flat().forEach((o) => {
      const requiredFields = o.availableFields.filter((af) => {
        const found = requiredSubfields.find(
          (rf) => rf.name === af.name && rf.origin === af.origin
        );
        if (found) {
          requiredSubfields = requiredSubfields.filter((f) => f !== found);
        }
        return !!found;
      });
      o.applyRequiredFields(requiredFields);
    });

    if (requiredSubfields.length) {
      console.log(
        requiredSubfields,
        [this.origin].flat().map((o) => o.availableFields)
      );
      throw new Error(
        `Could not find fields ${requiredSubfields.map((f) => f.def)}`
      );
    }
  }

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields(): ContextualisedField[] {
    return uniq(this.args.map(constituentFields).flat());
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      name: this.name,
      modifier: this.modifier,
      args: this.args.map((a) =>
        Array.isArray(a) ? a.map((subA) => subA.def) : a.def
      ),
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => o.def)
        : this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
      shape: this.shape?.map((f) => f.def),
    };
  }

  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...[this.origin].flat().map((o) => o.requirements),
      ...this.requiredFields.map((rf) => rf.requirements),
      ...this.args.map((a) => a.requirements)
    );
  }
}
