import {
  ContextualisedCollection,
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  ContextualisedTransform,
  isId,
} from '@arql/contextualiser';
import { Node, Requirements } from '@arql/models';
import { delegateCollection, DelegatedCollection } from './collection';
import { DelegatedResults } from './results';

type DelegatedTransformOrigin =
  | DelegatedCollection
  | DelegatedTransform
  | DelegatedResults;
export type DelegatedTransformOrigins =
  | DelegatedTransformOrigin
  | DelegatedTransformOrigin[];

/**
 * Transforms represent functions that act on entire collections.
 * examples might include `filter` and `union`
 */
export interface DelegatedTransformDef {
  name: string;
  modifier: string[];
  args: (
    | number
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
  )[];
  origin: DelegatedTransformOrigins;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DelegatedTransform extends DelegatedTransformDef {}
export class DelegatedTransform extends Node<DelegatedTransformDef> {
  type = 'delegated_transform' as const;

  /**
   * "shape" is the override external interface to the collection
   */
  shape?: ContextualisedField[] = undefined;

  /**
   * "requiredFields" have to be resolved in order to satisfy the root of the query
   * These should be a subset of the union of "availableFields" and "shape"
   */
  requiredFields: ContextualisedField[] = [];

  constructor(
    transform: ContextualisedTransform,
    origin: DelegatedTransformOrigins
  ) {
    super();
    this.name = transform.name;
    this.modifier = transform.modifier;
    this.args = transform.args;
    this.origin = origin;
    this.requiredFields = transform.requiredFields;
    this.shape = transform.shape;
  }

  get requirements(): Requirements {
    return this._requirements;
  }

  get def(): unknown {
    return {
      name: this.name,
      modifier: this.modifier,
      args: this.args.map((a) => (isId(a) ? a : a.def)),
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => o.def)
        : this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
      shape: this.shape?.map((f) => f.def),
    };
  }
}

export function delegateTransform(
  transform: ContextualisedTransform,
  queries: (ContextualisedCollection | ContextualisedTransform)[]
): DelegatedTransform | DelegatedResults {
  if (transform.origin instanceof DelegatedResults) {
    throw new Error('Transform already delegated');
  }

  if (transform.requirements.sources.length > 1) {
    if (Array.isArray(transform.origin)) {
      const origins: DelegatedTransformOrigin[] = [];
      for (const origin of transform.origin) {
        if (origin instanceof ContextualisedCollection) {
          origins.push(delegateCollection(origin, queries));
        } else {
          origins.push(delegateTransform(origin, queries));
        }
      }
      return new DelegatedTransform(transform, origins);
    } else {
      return new DelegatedTransform(
        transform,
        transform.origin instanceof ContextualisedCollection
          ? delegateCollection(transform.origin, queries)
          : delegateTransform(transform.origin, queries)
      );
    }
  } else if (transform.requirements.sources.length === 1) {
    const source = transform.requirements.sources[0];
    if (source.satisfies(transform.requirements)) {
      // break off this collection into its own query
      const resultsNode = new DelegatedResults({
        index: queries.length,
        id: transform.id,
        fields: transform.availableFields,
      });
      queries.push(transform);
      return resultsNode;
    } else if (Array.isArray(transform.origin)) {
      return new DelegatedTransform(
        transform,
        transform.origin.map((o) =>
          o instanceof ContextualisedCollection
            ? delegateCollection(o, queries)
            : delegateTransform(o, queries)
        )
      );
    } else {
      return new DelegatedTransform(
        transform,
        transform.origin instanceof ContextualisedCollection
          ? delegateCollection(transform.origin, queries)
          : delegateTransform(transform.origin, queries)
      );
    }
  } else {
    throw new Error('Transform should have at least one source');
  }
}
