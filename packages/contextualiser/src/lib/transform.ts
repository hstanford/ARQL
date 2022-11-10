import { combineRequirements, Node, Requirements } from '@arql/models';
import { Transform } from '@arql/parser';
import { TransformDef } from '@arql/types';
import { uniq } from '@arql/util';
import { ContextualisedFieldValue, getExpression } from './expr.js';
import { ContextualisedField, getField } from './field.js';
import { ID } from './id.js';
import {
  constituentFields,
  ContextualisedQuery,
  ContextualiserState,
  isId,
  selectField,
} from './util.js';

export function isMultiOrigin(
  origin: ContextualisedQuery | ContextualisedQuery[]
): origin is ContextualisedQuery[] {
  return Array.isArray(origin);
}

/**
 * Transforms represent functions that act on entire collections.
 * examples might include `filter` and `union`
 */
export interface ContextualisedTransformDef {
  /** an object tracking the state of the ast the field is part of */
  context: ContextualiserState;

  /** the interface definition of the transform that resolves this node */
  transform: TransformDef;

  /** flags that change the behaviour of the transform, e.g. "left" for a join */
  modifier: string[];

  /** arguments passed to the transform */
  args: ContextualisedFieldValue[];

  /** where the data offered by this transform comes from */
  origin: ContextualisedQuery | ContextualisedQuery[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextualisedTransform extends ContextualisedTransformDef {}

export class ContextualisedTransform extends Node<ContextualisedTransformDef> {
  type = 'contextualised_transform' as const;

  constructor(opts: ContextualisedTransformDef) {
    super(opts);
    this.id = this.context.items.length;
    this.context.items.push(this);

    this.name = this.transform.name;

    this._requirements.transforms.push(this.transform);
  }

  /** a number identifying this transform */
  id: number;

  /** the name of the function that resolves this node */
  name: string;

  /** the override external interface to the transform */
  shape?: ContextualisedField[] = undefined;

  /**
   * "requiredFields" have to be resolved in order to satisfy the root of the query
   * These should be a subset of the union of "availableFields" and "shape"
   */
  requiredFields: ContextualisedField[] = [];

  /**
   * a cache of the available fields: we don't want different instances of
   * fields coming back each time we access "availableFields"
   */
  _availableFields: ContextualisedField[] = [];

  /**
   * "Available fields" provide the fields that make up the external interface
   * of the transform. Other collections that originate from this transform
   * can reference and use these fields.
   */
  get availableFields(): ContextualisedField[] {
    if (this.shape) return this.shape;
    if (this._availableFields?.length) return this._availableFields;
    this._availableFields = uniq(
      [this.origin]
        .flat()
        .map((o) =>
          o.availableFields.map((f) => selectField(f, this, this.context))
        )
        .flat()
    );
    return this._availableFields;
  }

  /**
   * "applyRequiredFields" adds the "fields" passed to the method as required fields
   * and propagates the requirements down to the transform's origin[s]
   */
  applyRequiredFields(fields: ContextualisedField[]) {
    this.requiredFields = uniq(this.requiredFields.concat(fields));

    // propagate required fields down

    // collect constituent fields from the required fields. For example:
    // the field "foo: bar + baz" would require two fields from its origin
    let requiredSubfields: ID[] = [];
    for (const field of this.requiredFields) {
      requiredSubfields.push(...field.constituentFields);
    }
    requiredSubfields.push(...this.constituentFields);
    requiredSubfields = uniq(requiredSubfields);

    // find the required subFields within the origins and mark those as required
    [this.origin].flat().forEach((o) => {
      const requiredFields = o.availableFields.filter((af) => {
        const found = requiredSubfields.find((rf) => rf.id === af.id);
        if (found) {
          requiredSubfields = requiredSubfields.filter(
            (f) => f.id !== found.id
          );
        }
        return !!found;
      });
      o.applyRequiredFields(requiredFields);
    });

    if (requiredSubfields.length) {
      throw new Error(
        `Could not find fields ${requiredSubfields.map((f) => f)}`
      );
    }
  }

  /**
   * "constituentFields" lists all the core data fields that originate elsewhere
   */
  get constituentFields(): ID[] {
    return uniq(this.args.map(constituentFields).flat());
  }

  /** a serialisation getter for testing */
  get def(): unknown {
    return {
      id: this.id,
      name: this.name,
      modifier: this.modifier,
      args: this.args.map((a) => a.def),
      origin: Array.isArray(this.origin)
        ? this.origin.map((o) => o.def)
        : this.origin.def,
      requiredFields: this.requiredFields.map((r) => r.def),
      shape: this.shape?.map((f) => f.def),
    };
  }

  /**
   * Requirements that this transform and all its constituent nodes
   * demand in order for it to be resolved by any particular source
   */
  get requirements(): Requirements {
    return combineRequirements(
      this._requirements,
      ...[this.origin].flat().map((o) => o.requirements),
      ...this.requiredFields.map((rf) => rf.requirements),
      ...this.args.map((a) =>
        isId(a) ? this.context.get(a).requirements : a.requirements
      )
    );
  }
}

/**
 * Contextualises a transform
 * @param transform a transform object from @arql/parser
 * @param model the collection(s) that this transform acts on
 * @param context contains which models/collections are available at this level of the query
 * @returns a contextualised transform node
 */
export function getTransform(
  transform: Transform,
  model: ContextualisedQuery | ContextualisedQuery[],
  context: ContextualiserState
): ContextualisedTransform {
  const match = context.transforms.find(
    (tr) => tr.name === transform.description.root
  );
  if (!match)
    throw new Error(`Unrecognised transform ${transform.description.root}`);

  const contextualisedTransform = new ContextualisedTransform({
    context,
    transform: match,
    modifier: transform.description.parts.filter(
      (part) => match.modifiers && match.modifiers.includes(part)
    ),
    args: [],
    origin: model,
  });

  // handle transform arguments
  for (const arg of transform.args) {
    if (!Array.isArray(arg) && arg.type === 'shape') {
      // the last shape mentioned as a transform argument
      // becomes the external interface of the transform
      contextualisedTransform.shape = arg.fields
        .map((f) =>
          f.type === 'wildcard'
            ? [model]
                .flat()
                .map((m) =>
                  m.availableFields.map((f) =>
                    selectField(f, contextualisedTransform, context)
                  )
                )
                .flat()
            : getField(f, contextualisedTransform, context)
        )
        .flat();
      contextualisedTransform._requirements.flags.supportsShaping = true;
      continue;
    }
    if (!Array.isArray(arg) && arg.type === 'collection') {
      throw new Error('Collection as transform arg not supported');
    }
    contextualisedTransform.args.push(getExpression(arg, model, context));
  }

  return contextualisedTransform;
}
