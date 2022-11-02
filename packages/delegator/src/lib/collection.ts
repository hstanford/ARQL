import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedQuery,
  ContextualiserState,
  ID,
} from '@arql/contextualiser';
import { DataModel, Node, Requirements } from '@arql/models';
import { DelegatedResults } from './results';
import { DelegatedTransform } from './transform';
import { delegateOrigin } from './util';

export type DelegatedCollectionOrigin =
  | DataModel
  | DelegatedCollection
  | DelegatedTransform
  | DelegatedResults;

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
  origin: DelegatedCollectionOrigin;
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
  queries: ContextualisedQuery[]
): DelegatedCollection | DelegatedResults {
  if (collection.origin instanceof DelegatedResults) {
    throw new Error('Collection already delegated');
  }

  const sources = collection.requirements.sources;

  if (!sources.length) {
    throw new Error('Collection should have at least one source');
  }

  if (sources.length === 1 && sources[0].satisfies(collection.requirements)) {
    // break off this collection into its own query
    const resultsNode = new DelegatedResults({
      index: queries.length,
      id: collection.id,
      fields: collection.availableFields,
      name: collection.name,
    });
    queries.push(collection);
    return resultsNode;
  }

  if (collection.origin instanceof DataModel) {
    // perhaps this collection has a graph join (in which case support needs adding)?
    // Otherwise you should not have a single model coming from multiple sources
    throw new Error(
      'Collection from DataModel should be resolvable from a single data source'
    );
  }

  // if multiple sources are required to resolve the node, or the
  // one source required cannot satisfy the requirements, recurse
  // down until nodes are reached that only require one source
  return new DelegatedCollection(
    collection,
    delegateOrigin(collection.origin, queries)
  );
}
