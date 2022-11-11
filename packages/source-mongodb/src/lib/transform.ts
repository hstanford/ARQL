import {
  ContextualisedCollection,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel } from '@arql/models';
import { Document } from 'mongodb';
import { buildCollection } from './collection.js';
import { QueryDetails, SourceContext } from './context.js';
import { buildField, buildFieldValue } from './field.js';

export function buildTransform(
  transform: ContextualisedTransform,
  query: QueryDetails,
  context: SourceContext
): void {
  if (Array.isArray(transform.origin)) {
    throw new Error('Multi-origins not supported by MongoDb');
  }

  if (transform.origin instanceof DataModel) {
    query.collection = context.models[transform.origin.name];
  } else if (transform.origin instanceof ContextualisedCollection) {
    buildCollection(transform.origin, query, context);
  } else if (transform.origin instanceof ContextualisedTransform) {
    buildTransform(transform.origin, query, context);
  } else {
    throw new Error('Could not resolve collection origin');
  }

  context.transforms[transform.transform.name](
    transform,
    query,
    transform.args.map((arg) => buildFieldValue(arg, context)),
    transform.args,
    transform.modifier,
    context
  );

  // apply shape
  query.query.push({
    $project: transform.requiredFields.reduce(
      (acc, item) => {
        const [key, value] = buildField(item, context);
        acc[key] = value;
        return acc;
      },
      { _id: 0 } as Document
    ),
  });
}
