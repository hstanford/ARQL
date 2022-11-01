import {
  ContextualisedCollection,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { delegateCollection, DelegatedCollection } from './collection';
import { DelegatedResults } from './results';
import { DelegatedTransform, delegateTransform } from './transform';

export interface DelegatorOutput {
  delegatedQuery: DelegatedCollection | DelegatedResults | DelegatedTransform;
  subQueries: (ContextualisedCollection | ContextualisedTransform)[];
}

export function delegate(
  query: ContextualisedCollection | ContextualisedTransform
): DelegatorOutput {
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
