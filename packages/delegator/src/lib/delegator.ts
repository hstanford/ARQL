import {
  ContextualisedCollection,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { delegateCollection } from './collection';
import { delegateTransform } from './transform';

export function delegate(
  query: ContextualisedCollection | ContextualisedTransform
) {
  const subQueries: (ContextualisedCollection | ContextualisedTransform)[] = [];
  const delegatedQuery =
    query instanceof ContextualisedCollection
      ? delegateCollection(query, subQueries)
      : delegateTransform(query, subQueries);
  return {
    delegatedQuery, // the top-level query. Can contain DelegatedResults nodes
    subQueries, // subqueries that should not contain DelegatedResults, but correspond to DelegatedResults in the top-level query
  };
}
