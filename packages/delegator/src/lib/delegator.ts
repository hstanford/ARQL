import {
  ContextualisedCollection,
  ContextualisedQuery,
} from '@arql/contextualiser';
import { delegateCollection, DelegatedCollection } from './collection.js';
import { DelegatedResults } from './results.js';
import { DelegatedTransform, delegateTransform } from './transform.js';

export interface DelegatorOutput {
  /** the top-level query. Can contain DelegatedResults nodes */
  delegatedQuery: DelegatedCollection | DelegatedResults | DelegatedTransform;

  /**
   * subqueries that should not contain DelegatedResults,
   * but correspond to DelegatedResults in the top-level query
   */
  subQueries: ContextualisedQuery[];
}

// split up the query object based on which sources are supported at each level
export function delegate(query: ContextualisedQuery): DelegatorOutput {
  const subQueries: ContextualisedQuery[] = [];
  const delegatedQuery =
    query instanceof ContextualisedCollection
      ? delegateCollection(query, subQueries)
      : delegateTransform(query, subQueries);

  return { delegatedQuery, subQueries };
}
