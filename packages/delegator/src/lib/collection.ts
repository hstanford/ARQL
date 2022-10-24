import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel, Node, Requirements } from '@arql/models';
import { DelegatedResults } from './results';
import { DelegatedTransform, delegateTransform } from './transform';

/**
 * Collections are an intermediate state of data, representing a set
 * of homogeneous key-value records
 */
export interface DelegatedCollectionDef {
  name?: string;
  origin:
    | DataModel
    | DelegatedCollection
    | DelegatedTransform
    | DelegatedResults;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DelegatedCollection extends DelegatedCollectionDef {}
export class DelegatedCollection extends Node<DelegatedCollectionDef> {
  type = 'delegated_collection' as const;
  constructor(
    collection: ContextualisedCollection,
    origin: DelegatedCollection['origin']
  ) {
    super();
    this.name = collection.name;
    this.shape = collection.shape;
    this.requiredFields = collection.requiredFields;
    this._requirements = collection.requirements;
    this.origin = origin;
  }

  /**
   * "shape" is the override external interface to the collection
   */
  shape?: ContextualisedField[] = undefined;

  /**
   * "requiredFields" have to be resolved in order to satisfy the root of the query
   * These should be a subset of the union of "availableFields" and "shape"
   */
  requiredFields: ContextualisedField[] = [];

  get requirements(): Requirements {
    return this._requirements;
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
}

export function delegateCollection(
  collection: ContextualisedCollection,
  queries: (ContextualisedCollection | ContextualisedTransform)[]
): DelegatedCollection | DelegatedResults {
  if (collection.origin instanceof DelegatedResults) {
    throw new Error('Collection already delegated');
  }

  if (collection.requirements.sources.length > 1) {
    if (collection.origin instanceof DataModel) {
      // perhaps this collection has a graph join (in which case support needs adding)?
      // Otherwise you should not have a single model coming from multiple sources
      throw new Error(
        'Collection from DataModel should not have multiple sources'
      );
    }
    return new DelegatedCollection(
      collection,
      collection.origin instanceof ContextualisedCollection
        ? delegateCollection(collection.origin, queries)
        : delegateTransform(collection.origin, queries)
    );
  } else if (collection.requirements.sources.length === 1) {
    const source = collection.requirements.sources[0];
    if (source.satisfies(collection.requirements)) {
      // break off this collection into its own query
      const resultsNode = new DelegatedResults({
        index: queries.length,
        id: collection.id,
        fields: collection.availableFields,
      });
      queries.push(collection);
      return resultsNode;
    } else if (collection.origin instanceof DataModel) {
      throw new Error('Data model collection does not satisfy requirements');
    } else {
      return new DelegatedCollection(
        collection,
        collection.origin instanceof ContextualisedCollection
          ? delegateCollection(collection.origin, queries)
          : delegateTransform(collection.origin, queries)
      );
    }
  } else {
    throw new Error('Collection should have at least one source');
  }
}
