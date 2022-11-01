import { ContextualisedField } from '@arql/contextualiser';
import {
  DelegatedCollection,
  DelegatedResults,
  DelegatedTransform,
} from '@arql/delegator';
import { DataModel } from '@arql/models';
import { CollectorContext, ResultMap, Results } from './context';
import { buildFieldValue } from './field';
import { collectTransform } from './transform';

function isResultMaps(items: Results | ResultMap[]): items is ResultMap[] {
  return items[0] instanceof Map;
}

export function applyShape(
  shape: ContextualisedField[],
  records: Results | ResultMap[],
  constituentFields: ContextualisedField[],
  context: CollectorContext
) {
  return records.map((record) =>
    shape.reduce((acc, item) => {
      acc[item.name] = buildFieldValue(
        item.field,
        record,
        constituentFields,
        context
      );
      return acc;
    }, {} as Record<string, unknown>)
  );
}

export async function collectCollection(
  collection: DelegatedCollection,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<Results> {
  let constituentFields: ContextualisedField[] = [];
  let out: Results | ResultMap[] = [];
  if (collection.origin instanceof DataModel) {
    throw new Error('DataModel must be resolved by a source');
  } else if (collection.origin instanceof DelegatedResults) {
    out = queryResults[collection.origin.index];
    constituentFields = collection.origin.fields;
  } else if (collection.origin instanceof DelegatedCollection) {
    out = await collectCollection(collection.origin, queryResults, context);
    constituentFields = collection.origin.availableFields;
  } else if (collection.origin instanceof DelegatedTransform) {
    out = await collectTransform(collection.origin, queryResults, context);
    constituentFields = collection.origin.availableFields;
  } else {
    throw new Error('Unsupported collection origin');
  }

  const shape = collection.shape;
  if (shape) {
    out = applyShape(shape, out, constituentFields, context);
  }

  if (isResultMaps(out)) {
    throw new Error('Cannot produce result maps from collection');
  }

  return out;
}
