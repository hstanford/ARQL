import { Node, Requirements } from '@arql/models';
import { Type } from '@arql/types';

export interface IDDef {
  id: number;
  dataType?: Type;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ID extends IDDef {}
export class ID extends Node<IDDef> {
  type = 'ID' as const;
  /**
   * def is a serialisation getter for testing
   */
  get def() {
    return {
      id: this.id,
      dataType: this.dataType?.toString(),
    };
  }

  get requirements(): Requirements {
    return {
      sources: [],
      flags: {},
      functions: [],
      transforms: [],
      operations: [],
    };
  }
}
