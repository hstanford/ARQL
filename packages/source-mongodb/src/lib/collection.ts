import {
  ContextualisedCollection,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel } from '@arql/models';
import { Document } from 'mongodb';
import { QueryDetails, SourceContext } from './context.js';
import { buildField } from './field.js';
import { buildTransform } from './transform.js';

export function buildCollection(
  collection: ContextualisedCollection,
  query: QueryDetails,
  context: SourceContext
): void {
  if (collection.origin instanceof DataModel) {
    query.collection = context.models[collection.origin.name];
  } else if (collection.origin instanceof ContextualisedCollection) {
    buildCollection(collection.origin, query, context);
  } else if (collection.origin instanceof ContextualisedTransform) {
    buildTransform(collection.origin, query, context);
  } else {
    throw new Error('Could not resolve collection origin');
  }

  // apply shape
  query.query.push({
    $project: collection.requiredFields.reduce(
      (acc, item) => {
        const [key, value] = buildField(item, context);
        acc[key] = value;
        return acc;
      },
      { _id: 0 } as Document
    ),
  });
}
