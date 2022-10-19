import {
  combineRequirements,
  DataModel,
  DataSource,
  Node,
  Requirements,
} from '@arql/models';
import { uniq } from '@arql/util';
import { ContextualisedField } from './field';
import { ContextualisedTransform } from './transform';
import { selectField } from './util';

/**
 * Collections are an intermediate state of data, representing a set
 * of homogeneous key-value records
 */
export interface ContextualisedCollectionDef {
  name?: string;
  origin: DataModel | ContextualisedCollection | ContextualisedTransform;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedCollection extends ContextualisedCollectionDef {}
export class ContextualisedCollection extends Node<ContextualisedCollectionDef> {
  type = 'contextualised_collection' as const;
  propKeys = ['name', 'shape', 'origin', 'requiredFields'] as const;
  override _requirements: Requirements = {
    sources: [],
    flags: {
      subCollectionDepth: 1,
    },
    functions: [],
    transforms: [],
    operations: [],
  };

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
   * of the collection. Other collections that originate from this collection
   * can reference and use these fields.
   */
  get availableFields(): ContextualisedField[] {
    return (
      this.shape || this.origin.availableFields.map((f) => selectField(f, this))
    );
  }

  /**
   * "sources" list the data sources required to satisfy all the commitments
   * this collection has
   */
  get sources(): DataSource[] {
    return uniq(this.requiredFields.map((f) => f.sources).flat() || []);
  }

  /**
   * "applyRequiredFields" adds the "fields" passed to the method as required fields
   * and propagates the requirements down to the collection's origin
   */
  applyRequiredFields(fields: ContextualisedField[]) {
    this.requiredFields = uniq(this.requiredFields.concat(fields));
    // propagate required fields down if the origin is capable of holding requirements
    if (
      this.origin instanceof ContextualisedCollection ||
      this.origin instanceof ContextualisedTransform
    ) {
      // collect constituent fields from the required fields. For example:
      // the field "foo: bar + baz" would require two fields from its origin
      let requiredSubfields: ContextualisedField[] = [];
      for (const field of this.requiredFields) {
        requiredSubfields.push(...field.constituentFields);
      }
      // TODO: can we just pass requiredSubfields through as requiredFields?
      const requiredFields = this.origin.availableFields.filter((af) => {
        const found = requiredSubfields.find(
          (rf) => rf.name === af.name && rf.origin === af.origin
        );
        if (found) {
          requiredSubfields = requiredSubfields.filter((f) => f !== found);
        }
        return !!found;
      });
      this.origin.applyRequiredFields(requiredFields);
      if (requiredSubfields.length) {
        throw new Error(
          `Couldn't find fields ${JSON.stringify(
            requiredSubfields.map((f) => f.def)
          )}`
        );
      }
    }
  }

  /**
   * def is a serialisation getter for testing
   */
  get def(): unknown {
    return {
      name: this.name,
      shape: this.shape?.map((f) => f.def),
      origin: this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
    };
  }

  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...[this.origin].flat().map((o) => o.requirements),
      ...this.requiredFields.map((rf) => rf.requirements)
    );
  }
}
