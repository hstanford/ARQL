import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedTransform,
  ContextualiserState,
  ID,
} from '@arql/contextualiser';
import { DataModel, Node, Requirements } from '@arql/models';
import { DelegatedResults } from './results';
import { DelegatedTransform, delegateTransform } from './transform';

/**
 * Collections are an intermediate state of data, representing a set
 * of homogeneous key-value records
 */
export interface DelegatedCollectionDef {
  /** an object tracking the state of the ast the collection is part of */
  context: ContextualiserState;

  /** the name of this collection - can be referred to in the rest of the query */
  name?: string;

  /** where the data offered by this collection comes from */
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
    this.id = collection.id;
    this.name = collection.name;
    this.shape = collection.shape;
    this.requiredFields = collection.requiredFields;
    this.availableFields = collection.availableFields;
    this._requirements = collection.requirements;
    this.origin = origin;
  }

  /** a number identifying this collection */
  id: ID;

  /** the override external interface to the collection */
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
  availableFields: ContextualisedField[];

  get requirements(): Requirements {
    return this._requirements;
  }

  /** a serialisation getter for testing */
  get def(): unknown {
    return {
      name: this.name,
      shape: this.shape?.map((f) => f.def),
      origin: this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
    };
  }
}

/**
 * recursively check if a node can be broken off and resolved independently
 * in which case it's added to "queries" and replaced with a DelegatedResults node
 */
export function delegateCollection(
  collection: ContextualisedCollection,
  queries: (ContextualisedCollection | ContextualisedTransform)[]
): DelegatedCollection | DelegatedResults {
  if (collection.origin instanceof DelegatedResults) {
    throw new Error('Collection already delegated');
  }

  if (collection.requirements.sources.length > 1) {
    // if multiple sources are required to resolve the node, recurse down
    // until nodes are reached that only require one source
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
        name: collection.name,
      });
      queries.push(collection);
      return resultsNode;
    } else if (collection.origin instanceof DataModel) {
      throw new Error('Data model collection does not satisfy requirements');
    } else {
      // if the source does not satisfy this node, recurse until
      // a node is found that is satisfied by the source
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
