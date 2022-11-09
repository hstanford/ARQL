import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedQuery,
  ContextualisedTransform,
  isMultiOrigin,
} from '@arql/contextualiser';
import { resolveCollection } from './collection.js';
import { SourceContext, Row, ResultMap, Records } from './context.js';
import { buildFieldValue } from './field.js';

type OriginValue<T> = T extends ContextualisedQuery[]
  ? Record<string, Records>
  : Row[];

type OriginResult<T> = {
  origin: OriginValue<T>;
  constituentFields: ContextualisedField[];
};

export function resolveArgs(
  transform: ContextualisedTransform,
  record: Row | ResultMap,
  constituentFields: ContextualisedField[],
  context: SourceContext
) {
  return transform.args.map((arg) =>
    buildFieldValue(arg, record, constituentFields, context)
  );
}

// resolve the data of the origin(s) of a transform and the
// fields that are exposed by that data
async function getOrigins<
  T extends ContextualisedQuery | ContextualisedQuery[]
>(origin: T, context: SourceContext): Promise<OriginResult<T>> {
  // fields exposed by the origin(s)
  const constituentFields: ContextualisedField[] = [];

  // resolve the data of a single origin and capture its exposed fields
  async function transformOrigin(origin: ContextualisedQuery) {
    let out: Records = [];
    if (origin instanceof ContextualisedCollection) {
      out = await resolveCollection(origin, context);
      constituentFields.push(...origin.availableFields);
    } else if (origin instanceof ContextualisedTransform) {
      out = await resolveTransform(origin, context);
      constituentFields.push(...origin.availableFields);
    } else {
      throw new Error('Unsupported collection origin');
    }
    return out;
  }

  // resolve all the origins
  let origins: Record<string, Records> | Records | undefined = undefined;
  if (isMultiOrigin(origin)) {
    origins = {};
    for (const singleOrigin of origin) {
      // we need a name in order to build the origins map
      if (!singleOrigin.name) {
        throw new Error('Expected name for origin');
      }

      origins[singleOrigin.name] = await transformOrigin(singleOrigin);
    }
  } else {
    origins = await transformOrigin(origin);
  }

  return {
    // cast is necessary in order to preserve expected signature
    origin: origins as OriginValue<T>,
    constituentFields,
  };
}

// resolve and transform the data this transform node represents
export async function resolveTransform(
  transform: ContextualisedTransform,
  context: SourceContext
): Promise<Records> {
  // resolve the data of the origin(s)
  const { origin, constituentFields } = await getOrigins(
    transform.origin,
    context
  );

  // assert the specified transformation function is configured
  const transformFn = context.transforms[transform.name];
  if (!transformFn) {
    throw new Error(`Missing transform implementation for ${transform.name}`);
  }

  // run the transform over the data
  return transformFn(transform, origin, constituentFields, context);
}
