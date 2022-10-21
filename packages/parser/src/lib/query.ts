import {
  choice,
  optionalWhitespace,
  Parser,
  possibly,
  sequenceOf,
} from 'arcsecond';
import { collection, Collection, collectionWithShape } from './collection';

export interface Query {
  type: 'query';
  value: Collection | null;
}

// the query parser is used to parse all forms of queries
export const query: Parser<Query> = sequenceOf([
  optionalWhitespace,
  possibly(choice([collection, collectionWithShape])),
  optionalWhitespace,
]).map((parts) => ({
  type: 'query',
  value: parts[1],
}));
