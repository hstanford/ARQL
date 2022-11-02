import { parse } from '@arql/parser';
import { contextualise, ContextualiserConfig } from '@arql/contextualiser';
import { delegate } from '@arql/delegator';
import { collector, CollectorConfig } from '@arql/collector';

/**
 * CORE
 *
 * The role of the core lib is to connect the critical arql libraries
 * parser -> contextualiser -> delegator -> collector
 * and allow a full resolution of data from a query string
 */
export function runner({
  contextualiserConfig,
  collectorConfig,
}: {
  contextualiserConfig: ContextualiserConfig;
  collectorConfig: CollectorConfig;
}) {
  return async function (query: string, params: unknown[]) {
    const parsed = parse(query);
    const contextualised = contextualise(parsed, contextualiserConfig);
    const delegated = delegate(contextualised);
    const collected = await collector(delegated, params, collectorConfig);
    return collected;
  };
}
