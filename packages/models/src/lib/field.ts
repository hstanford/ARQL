import { DataModel } from './model';
import { Node } from './node';
import { Requirements } from './requirements';

// valid data types - to be used to build expected output types and possibly
// also to restrict the data types of function or operation arguments
export type DataType = 'string' | 'number' | 'boolean' | 'json' | 'date';

// the configuration that can be used to instantiate a new data field
export interface DataFieldDef {
  name: string;
  datatype: DataType;
  fields?: DataFieldDef[];
}

// represents the equivalent of a column in a relational database
export class DataField extends Node {
  constructor(opts: DataFieldDef, model: DataModel) {
    super();
    this.name = opts.name;
    this.datatype = opts.datatype;
    this.fields = (opts.fields || []).map((f) => new DataField(f, model));
    this.model = model;
  }

  // the "key" for this field
  name: string;

  datatype: DataType;

  // any subfields this field contains (not currently supported)
  fields: DataField[];

  model: DataModel;

  /** serialisation getter for testing */
  get def(): DataFieldDef {
    return {
      name: this.name,
      datatype: this.datatype,
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
