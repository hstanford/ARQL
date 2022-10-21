import { Parser, regex } from 'arcsecond';

// first_name, firstName, f1rstnam3 etc
export const keyword: Parser<string> = regex(/^[a-zA-Z_][a-zA-Z0-9_]*/);
