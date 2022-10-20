import { run } from './parser';

describe('base expr', () => {
  it('parses an expression successfully', () => {
    const out = run('thing + foo', 'expr');
    expect(out).toEqual([
      { parts: [], root: 'thing', type: 'alphachain' },
      { type: 'op', symbol: '+' },
      { parts: [], root: 'foo', type: 'alphachain' },
    ]);
  });

  it('should handle plain alphachains', () => {
    const out = run('foo', 'expr');
    expect(out).toEqual({
      type: 'alphachain',
      root: 'foo',
      parts: [],
    });
  });

  it('should handle plain params', () => {
    const out = run('$1', 'expr');
    expect(out).toEqual({
      type: 'param',
      index: 1,
    });
  });

  it('should handle nested and non-nested expressions', () => {
    const out = run('(foo.bar === $1) && !baz', 'expr');
    expect(out).toEqual([
      [
        {
          type: 'alphachain',
          root: 'foo',
          parts: ['bar'],
        },
        {
          type: 'op',
          symbol: '===',
        },
        {
          type: 'param',
          index: 1,
        },
      ],
      {
        type: 'op',
        symbol: '&&',
      },
      {
        type: 'op',
        symbol: '!',
      },
      {
        type: 'alphachain',
        root: 'baz',
        parts: [],
      },
    ]);
  });
});

describe('exprNoOp', () => {
  it('matches a param', () => {
    const out = run('$20', 'exprNoOp');
    expect(out).toEqual({
      type: 'param',
      index: 20,
    });
  });

  it('matches an alphachain', () => {
    const out = run('users.name', 'exprNoOp');
    expect(out).toEqual({
      type: 'alphachain',
      root: 'users',
      parts: ['name'],
    });
  });

  it('matches a parenthesised expression', () => {
    const out = run('($1)', 'exprNoOp');
    expect(out).toEqual({ type: 'param', index: 1 });
  });

  it('matches a function', () => {
    const out = run('test($1)', 'exprNoOp');
    expect(out).toEqual({
      type: 'function',
      name: {
        type: 'alphachain',
        root: 'test',
        parts: [],
      },
      args: [
        {
          type: 'param',
          index: 1,
        },
      ],
    });
  });

  it('matches an expression', () => {
    const out = run('(test + foo)', 'exprNoOp');
    expect(out).toEqual([
      {
        type: 'alphachain',
        root: 'test',
        parts: [],
      },
      {
        type: 'op',
        symbol: '+',
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
    ]);
  });
});

describe('exprOp', () => {
  it('matches prefix operators', () => {
    const out = run('!foo', 'exprOp');
    expect(out).toEqual([
      {
        type: 'op',
        symbol: '!',
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
    ]);
  });

  it('matches postfix operators', () => {
    const out = run('foo!', 'exprOp');
    expect(out).toEqual([
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
      {
        type: 'op',
        symbol: '!',
      },
    ]);
  });

  it('matches combinations of prefix and postfix operators', () => {
    const out = run('! : foo.bar & & @', 'exprOp');
    expect(out).toEqual([
      {
        type: 'op',
        symbol: '!',
      },
      {
        type: 'op',
        symbol: ':',
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: ['bar'],
      },
      {
        type: 'op',
        symbol: '&',
      },
      {
        type: 'op',
        symbol: '&',
      },
      {
        type: 'op',
        symbol: '@',
      },
    ]);
  });

  it('matches unary expressions', () => {
    const out = run('!foo', 'exprOp');
    expect(out).toEqual([
      {
        type: 'op',
        symbol: '!',
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
    ]);
  });

  it('matches binary expressions', () => {
    const out = run('foo + bar.baz', 'exprOp');
    expect(out).toEqual([
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
      {
        type: 'op',
        symbol: '+',
      },
      {
        type: 'alphachain',
        root: 'bar',
        parts: ['baz'],
      },
    ]);
  });

  it('matches ternary expressions', () => {
    const out = run('foo + bar.baz * bat!', 'exprOp');
    expect(out).toEqual([
      {
        type: 'alphachain',
        root: 'foo',
        parts: [],
      },
      {
        type: 'op',
        symbol: '+',
      },
      {
        type: 'alphachain',
        root: 'bar',
        parts: ['baz'],
      },
      {
        type: 'op',
        symbol: '*',
      },
      {
        type: 'alphachain',
        root: 'bat',
        parts: [],
      },
      {
        type: 'op',
        symbol: '!',
      },
    ]);
  });
});

describe('exprlist', () => {
  it('should match a comma-separated series of expressions', () => {
    const out = run('$1, foo.bar, baz + $2', 'exprlist');
    expect(out).toEqual([
      {
        type: 'param',
        index: 1,
      },
      {
        type: 'alphachain',
        root: 'foo',
        parts: ['bar'],
      },
      [
        {
          type: 'alphachain',
          root: 'baz',
          parts: [],
        },
        {
          type: 'op',
          symbol: '+',
        },
        {
          type: 'param',
          index: 2,
        },
      ],
    ]);
  });

  it('should return null for an empty string', () => {
    const out = run('', 'exprlist');
    expect(out).toEqual(null);
  });
});
