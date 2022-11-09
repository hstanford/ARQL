import { PrimitiveType, Type } from '@arql/types';
import { DataModel } from './model.js';
import { Node } from './node.js';
import { Requirements } from './requirements.js';

// the configuration that can be used to instantiate a new data field
export interface DataFieldDef {
  name: string;
  dataType: Type;
  fields?: DataFieldDef[];
  sourceDataType: string;
}

// represents the equivalent of a column in a relational database
export class DataField extends Node {
  constructor(opts: DataFieldDef, model: DataModel) {
    super();
    this.name = opts.name;
    this.dataType = opts.dataType;
    this.sourceDataType = opts.sourceDataType;
    this.fields = (opts.fields || []).map((f) => new DataField(f, model));
    this.model = model;
  }

  // the "key" for this field
  name: string;

  dataType: Type;

  sourceDataType: string;

  // any subfields this field contains (not currently supported)
  fields: DataField[];

  model: DataModel;

  /** serialisation getter for testing */
  get def() {
    return {
      name: this.name,
      dataType:
        this.dataType instanceof PrimitiveType
          ? this.dataType.name
          : this.dataType,
      sourceDataType: this.sourceDataType,
      // TODO: implement nested fields
      //fields: this.fields?.map((f) => f.def),
    };
  }

  // in addition to any externally imposed requirements, this field
  // also requires the source that its model belongs to
  get requirements(): Requirements {
    return {
      ...this._requirements,
      sources: this._requirements.sources.concat(this.model.source),
    };
  }
}
