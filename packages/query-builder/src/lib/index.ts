class Param {
  value: unknown;
  constructor(param: unknown) {
    this.value = param;
  }
}

class QueryObject {
  items: (Param | string)[] = [];

  constructor(strings: string[], params: unknown[]) {
    // interleave strings and params, extracting items
    // of other QueryObjects passed as params
    for (const [idx, value] of strings.entries()) {
      this.items.push(value);
      if (idx >= params.length) {
        continue;
      }
      const param = params[idx];
      if (param instanceof QueryObject) {
        this.items.push(...param.items);
      } else {
        this.items.push(new Param(param));
      }
    }
  }

  get value() {
    const params: unknown[] = [];

    // concatenate strings while extracting
    // the params and replacing them with "$n"
    const query = this.items.reduce((acc, item) => {
      if (item instanceof Param) {
        params.push(item.value);
        acc += '$' + params.length;
      } else {
        acc += item;
      }
      return acc;
    }, '');

    return {
      query,
      params,
    };
  }
}

export function arql(strings: TemplateStringsArray, ...params: unknown[]) {
  return new QueryObject([...strings], params);
}
