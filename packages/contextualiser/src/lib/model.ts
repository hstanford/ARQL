import { DataModel } from '@arql/models';
import { Alphachain } from '@arql/parser';
import { ContextualisedCollection } from './collection';
import { ContextualisedQuery, ContextualiserState } from './util';

/**
 * Retrieves a model or collection
 * @param alphachain an object describing the model the query wants
 * @param context contains which models/collections are available at this level of the query
 * @returns a collection or data model
 */
export function getModel(alphachain: Alphachain, context: ContextualiserState) {
  let model: ContextualisedQuery | DataModel | undefined;
  if (context.aliases.has(alphachain.root)) {
    // it's the name of a collection in scope
    model = context.aliases.get(alphachain.root);
  } else if (context.models.has(alphachain.root)) {
    // it's the name of a datamodel
    model = context.models.get(alphachain.root);
  }

  if (!model) {
    throw new Error(`Failed to find model ${JSON.stringify(alphachain)}`);
  }

  // DataModels need wrapping in a collection otherwise
  // it becomes tricky to apply a complex shape directly
  if (model instanceof DataModel) {
    return new ContextualisedCollection({
      context,
      origin: model,
      name: model.name,
    });
  }

  return model;
}
