import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { Query } from 'sql-ts';
import { buildCollection } from './collection';
import { SourceContext } from './context';
import { buildField, buildFieldValue } from './field';
import { Column, SubQuery } from './types';

// select a set of columns from a subquery as a new subquery
export function applyShape(
  subQuery: SubQuery,
  name: string,
  shape: ContextualisedField[],
  constituentFields: Record<number, Column>,
  context: SourceContext
) {
  return subQuery.table
    .subQuery(name)
    .select(...shape.map((f) => buildField(f, constituentFields, context)))
    .from(subQuery) as SubQuery;
}

// build a sql query for a transform
export function buildTransform(
  transform: ContextualisedTransform,
  context: SourceContext
): SubQuery {
  const transformFn = context.transforms[transform.transform.name];
  if (!transformFn) {
    throw new Error(`Could not find transform ${transform.transform.name}`);
  }

  const origins: SubQuery[] = [];
  const constituentFields: Record<number, Column> = {};

  // build queries for all origins
  for (const orig of [transform.origin].flat()) {
    let origin: SubQuery;
    if (orig instanceof ContextualisedCollection) {
      origin = buildCollection(orig, context) as SubQuery;
    } else if (orig instanceof ContextualisedTransform) {
      origin = buildTransform(orig, context);
    } else {
      throw new Error('Unrecognised transform origin');
    }

    // keep track of the fields the origins expose (consistuentFields)
    for (const rf of orig.requiredFields) {
      const col = origin.columns.find((c) => (c.alias ?? c.name) === rf.name);
      if (!col) {
        throw new Error(`Could not find column ${rf.name}`);
      }
      constituentFields[rf.id.id] = col;
    }

    origins.push(origin);
  }

  // apply the transformation functions to the origin queries
  const out = transformFn(
    transform,
    origins,
    transform.args.map((arg) =>
      buildFieldValue(arg, constituentFields, context)
    ),
    constituentFields,
    context
  );

  if (!(out instanceof Query)) {
    throw new Error(
      'Expected a query - perhaps a failed multi-origin transform'
    );
  }

  return out;
}
