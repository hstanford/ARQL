import { ContextualisedField } from '@arql/contextualiser';
import { Node, Requirements } from '@arql/models';

/**
 * "DelegatedResults" is a placeholder node in the primary query tree
 * which represents the results of a delegated query.
 */
export interface DelegatedResultsDef {
  /** the index identifies which delegated query these results are for */
  index: number;

  /** the ID of the node that the results node has replaced */
  id: number;

  /** the fields exposed by the detatched node */
  fields: ContextualisedField[]; // FIXME: these fields still have an origin pointing to a collection/transform

  /** the name of the node the results node has replaced */
  name?: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DelegatedResults extends DelegatedResultsDef {}
export class DelegatedResults extends Node<DelegatedResultsDef> {
  type = 'delegated_results' as const;

  get requirements(): Requirements {
    return this._requirements;
  }

  get def() {
    return {
      index: this.index,
      id: this.id,
      fields: this.fields.map((f) => f.def),
    };
  }
}
