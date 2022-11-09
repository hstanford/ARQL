import {
  combineRequirements,
  DataModel,
  Node,
  Requirements,
} from '@arql/models';
import { Collection, getAlias } from '@arql/parser';
import { uniq } from '@arql/util';
import { ContextualisedField, getField } from './field.js';
import { getModel } from './model.js';
import { getTransform } from './transform.js';
import {
  ContextualisedOrigin,
  ContextualisedQuery,
  ContextualiserState,
  ID,
  selectField,
} from './util.js';

/**
 * Collections are an intermediate state of data, representing a set
 * of homogeneous key-value records
 */
export interface ContextualisedCollectionDef {
  /** an object tracking the state of the ast the collection is part of */
  context: ContextualiserState;

  /** the name of this collection - can be referred to in the rest of the query */
  name?: string;

  /** where the data offered by this collection comes from */
  origin: ContextualisedOrigin;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedCollection extends ContextualisedCollectionDef {}

export class ContextualisedCollection extends Node<ContextualisedCollectionDef> {
  type = 'contextualised_collection' as const;

  /**
   * Requirements that this collection (but not its origin or fields) demands
   * in order for it to be resolved by any particular source
   */
  override _requirements: Requirements = {
    sources: [],
    flags: {
      // this collection adds 1 to the collection depth
      subCollectionDepth: 1,
    },
    functions: [],
    transforms: [],
    operations: [],
  };

  constructor(opts: ContextualisedCollectionDef) {
    super(opts);
    this.id = {
      type: 'ID',
      id: this.context.items.length,
    };
    this.context.items.push(this);
  }

  /** a number identifying this collection */
  id: ID;

  /** the override external interface to the collection */
  shape?: ContextualisedField[] = undefined;

  /**
   * a cache of the available fields: we don't want different instances of
   * fields coming back each time we access "availableFields"
   */
  private _availableFields: ContextualisedField[] = [];

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
    if (this.shape) {
      return this.shape;
    }
    if (this._availableFields.length) {
      return this._availableFields;
    }
    this._availableFields = this.origin.availableFields.map((f) =>
      selectField(f, this, this.context)
    );
    return this._availableFields;
  }

  /**
   * "applyRequiredFields" adds the "fields" passed to the method as required fields
   * and propagates the requirements down to the collection's origin
   */
  applyRequiredFields(fields: ContextualisedField[]) {
    this.requiredFields = uniq(this.requiredFields.concat(fields));

    if (this.origin instanceof DataModel) {
      return;
    }

    // propagate required fields down if the origin is capable of holding requirements

    // collect constituent fields from the required fields. For example:
    // the field "foo: bar + baz" would require two fields from its origin
    let requiredSubfields: ID[] = [];
    for (const field of this.requiredFields) {
      requiredSubfields.push(...field.constituentFields);
    }

    // find the required subFields within the origin and mark those as required
    const requiredFields = this.origin.availableFields.filter((af) => {
      const found = requiredSubfields.find((rf) => rf === af.id);
      if (found) {
        requiredSubfields = requiredSubfields.filter((f) => f !== found);
      }
      return !!found;
    });
    this.origin.applyRequiredFields(requiredFields);

    if (requiredSubfields.length) {
      throw new Error(
        `Couldn't find fields ${JSON.stringify(
          requiredSubfields.map((f) => f)
        )}`
      );
    }
  }

  /** serialisation getter for testing */
  get def(): unknown {
    return {
      id: this.id,
      name: this.name,
      shape: this.shape?.map((f) => f.def),
      origin: this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
    };
  }

  /**
   * Requirements that this collection and all its constituent nodes
   * demand in order for it to be resolved by any particular source
   */
  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...[this.origin].flat().map((o) => o.requirements),
      ...this.requiredFields.map((rf) => rf.requirements)
    );
  }
}

/**
 * Contextualises a collection
 * @param collection a collection from @arql/parser
 * @param context contains which models/collections are available at this level of the query
 * @returns a contextualised collection
 */
export function handleCollection(
  collection: Collection,
  context: ContextualiserState
): ContextualisedQuery {
  let value: ContextualisedQuery | ContextualisedQuery[];

  // recursively handle collection values, so the tree is contextualised
  // from the leaves upwards
  if (Array.isArray(collection.value)) {
    value = collection.value.map((s) => handleCollection(s, context));
  } else if (collection.value?.type === 'collection') {
    value = handleCollection(collection.value, context);
  } else if (collection.value?.type === 'alphachain') {
    const model = getModel(collection.value, context);
    if (!model) {
      throw new Error(`Could not find model ${getAlias(collection.value)}`);
    }

    value = new ContextualisedCollection({
      context,
      origin: model,
      name: collection.alias ?? model.name,
    });
  } else {
    throw new Error(`Could not handle ${collection.value}`);
  }

  // make the collection's constituent collections available to
  // retrieve fields from
  for (const coll of [value].flat()) {
    if (coll.name) {
      context.aliases.set(coll.name, coll);
    }
  }

  // apply transformations to the collection
  if (collection.transforms.length) {
    for (const transform of collection.transforms) {
      value = getTransform(transform, value, context);
    }
  }

  if (Array.isArray(value)) {
    throw new Error('Cannot handle an untransformed multi-collection');
  }

  // Narrowed to single collection
  let out: ContextualisedQuery = value;

  // Apply the shape
  if (collection.shape) {
    if (Array.isArray(collection.shape)) {
      throw new Error('Multi-shapes are not currently supported');
    }
    out.shape = uniq(
      collection.shape.fields
        .map((field) =>
          field.type === 'wildcard'
            ? out.availableFields.map((f) => selectField(f, out, context))
            : getField(field, out, context)
        )
        .flat()
    );
    out._requirements.flags.supportsShaping = true;
  }

  // alias the collection if needed
  if (collection.alias) {
    out = new ContextualisedCollection({
      context,
      name: collection.alias,
      origin: value,
    });
    context.aliases.set(collection.alias, value);
  }

  return out;
}
