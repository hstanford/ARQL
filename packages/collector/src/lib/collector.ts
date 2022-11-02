import {
  DelegatedCollection,
  DelegatedResults,
  DelegatedTransform,
  DelegatorOutput,
} from '@arql/delegator';
import { Dictionary } from '@arql/util';
import { collectCollection } from './collection';
import { CollectorConfig, CollectorContext } from './context';
import { collectTransform } from './transform';

// resolve a delegated query
export async function collector(
  { delegatedQuery, subQueries }: DelegatorOutput,
  params: unknown[],
  config: CollectorConfig
): Promise<unknown> {
  const context: CollectorContext = { ...config, params };

  // retrieve the results of the delegated subqueries
  const queryResults: Dictionary[][] = [];
  for (const query of subQueries) {
    const source = query.requirements.sources[0];
    const resolved = await source.resolve(query, context.params);
    queryResults.push(resolved);
  }

  // combine the results of the delegated subqueries into the expected format
  if (delegatedQuery instanceof DelegatedResults) {
    return queryResults[delegatedQuery.index];
  } else if (delegatedQuery instanceof DelegatedCollection) {
    return await collectCollection(delegatedQuery, queryResults, context);
  } else if (delegatedQuery instanceof DelegatedTransform) {
    return await collectTransform(delegatedQuery, queryResults, context);
  } else {
    throw new Error('Unable to resolve delegated query');
  }
}
