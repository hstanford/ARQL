import {
  ContextualisedCollection,
  ContextualisedQuery,
} from '@arql/contextualiser';
import { delegateCollection } from './collection';
import {
  DelegatedTransformOrigin,
  DelegatedTransformOrigins,
  delegateTransform,
} from './transform';

/**
 * Delegate a node in the contextualised query tree
 * @param origin The node in the contextualised query tree we're trying to delegate
 * @param queries Array of queries that have been delegated - to add to
 * @returns Delegated collection, transform, or results node
 */
export function delegateOrigin(
  origin: ContextualisedQuery,
  queries: ContextualisedQuery[]
): DelegatedTransformOrigin {
  return origin instanceof ContextualisedCollection
    ? delegateCollection(origin, queries)
    : delegateTransform(origin, queries);
}

/**
 * Delegate potentially multiple nodes in the contextualised query tree
 * @param origin The node(s) in the contextualised query tree we're trying to delegate
 * @param queries Array of queries that have been delegated - to add to
 * @returns Delegated collection, transform, or results node(s)
 */
export function delegateOrigins(
  origin: ContextualisedQuery | ContextualisedQuery[],
  queries: ContextualisedQuery[]
): DelegatedTransformOrigins {
  if (Array.isArray(origin)) {
    return origin.map((orig) => delegateOrigin(orig, queries));
  } else {
    return delegateOrigin(origin, queries);
  }
}
