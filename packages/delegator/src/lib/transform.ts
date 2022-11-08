import {
  ContextualisedExpr,
  ContextualisedField,
  ContextualisedFunction,
  ContextualisedParam,
  ContextualisedQuery,
  ContextualisedTransform,
  ContextualiserState,
  ID,
  isId,
} from '@arql/contextualiser';
import { Node, Requirements } from '@arql/models';
import { TransformDef } from '@arql/types';
import { DelegatedCollection } from './collection';
import { DelegatedResults } from './results';
import { delegateOrigins } from './util';

export type DelegatedTransformOrigin =
  | DelegatedCollection
  | DelegatedTransform
  | DelegatedResults;
export type DelegatedTransformOrigins =
  | DelegatedTransformOrigin
  | DelegatedTransformOrigin[];

export function isMultiOrigin(
  origin: DelegatedTransformOrigins
): origin is DelegatedTransformOrigin[] {
  return Array.isArray(origin);
}

/**
 * Transforms represent functions that act on entire collections.
 * examples might include `filter` and `union`
 */
export interface DelegatedTransformDef {
  /** an object tracking the state of the ast the field is part of */
  context: ContextualiserState;

  /** the interface definition of the transform that resolves this node */
  transform: TransformDef;

  /** flags that change the behaviour of the transform, e.g. "left" for a join */
  modifier: string[];

  /** arguments passed to the transform */
  args: (
    | ID
    | ContextualisedExpr
    | ContextualisedParam
    | ContextualisedFunction
  )[];

  /** where the data offered by this transform comes from */
  origin: DelegatedTransformOrigins;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DelegatedTransform extends DelegatedTransformDef {}

export class DelegatedTransform extends Node<DelegatedTransformDef> {
  type = 'delegated_transform' as const;

  /** the override external interface to the collection */
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
    this.id = transform.id;
    this.context = transform.context;
    this.name = transform.name;
    this.modifier = transform.modifier;
    this.args = transform.args;
    this.requiredFields = transform.requiredFields;
    this.shape = transform.shape;

    this.origin = origin;
  }

  /** a number identifying this transform */
  id: ID;

  /** the name of the function that resolves this node */
  name: string;

  /**
   * "Available fields" provide the fields that make up the external interface
   * of the transform. Other collections that originate from this transform
   * can reference and use these fields.
   */
  availableFields: ContextualisedField[] = [];

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

/**
 * recursively check if a node can be broken off and resolved independently
 * in which case it's added to "queries" and replaced with a DelegatedResults node
 */
export function delegateTransform(
  transform: ContextualisedTransform,
  queries: ContextualisedQuery[]
): DelegatedTransform | DelegatedResults {
  if (transform.origin instanceof DelegatedResults) {
    throw new Error('Transform already delegated');
  }

  const sources = transform.requirements.sources;

  if (!sources.length) {
    throw new Error('Transform should have at least one source');
  }

  if (sources.length === 1 && sources[0].satisfies(transform.requirements)) {
    // break off this collection into its own query
    const resultsNode = new DelegatedResults({
      index: queries.length,
      id: transform.id,
      fields: transform.availableFields,
      name: transform.name,
    });
    queries.push(transform);
    return resultsNode;
  }

  // if multiple sources are required to resolve the node, or the
  // one source required cannot satisfy the requirements, recurse
  // down until nodes are reached that only require one source
  return new DelegatedTransform(
    transform,
    delegateOrigins(transform.origin, queries)
  );
}
