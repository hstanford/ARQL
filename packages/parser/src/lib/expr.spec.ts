import { expr, exprlist, exprNoOp, exprOp } from './expr';
import { assertNoError } from './test_helpers';

describe('base expr', () => {
  it('parses an expression successfully', () => {
    const out = expr.run('thing + foo');
    assertNoError(out);
    expect(out.result).toEqual([
      { parts: [], root: 'thing', type: 'alphachain' },
      { type: 'op', symbol: '+' },
      { parts: [], root: 'foo', type: 'alphachain' },
    ]);
  });

  it('should handle plain alphachains', () => {
    const out = expr.run('foo');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'alphachain',
      root: 'foo',
      parts: [],
    });
  });

  it('should handle plain params', () => {
    const out = expr.run('$1');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'param',
      index: 1,
    });
  });

  it('should handle nested and non-nested expressions', () => {
    const out = expr.run('(foo.bar === $1) && !baz');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprNoOp.run('$20');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'param',
      index: 20,
    });
  });

  it('matches an alphachain', () => {
    const out = exprNoOp.run('users.name');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'alphachain',
      root: 'users',
      parts: ['name'],
    });
  });

  it('matches a parenthesised expression', () => {
    const out = exprNoOp.run('($1)');
    assertNoError(out);
    expect(out.result).toEqual({ type: 'param', index: 1 });
  });

  it('matches a function', () => {
    const out = exprNoOp.run('test($1)');
    assertNoError(out);
    expect(out.result).toEqual({
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
    const out = exprNoOp.run('(test + foo)');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('!foo');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('foo!');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('! : foo.bar & & @');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('!foo');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('foo + bar.baz');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprOp.run('foo + bar.baz * bat!');
    assertNoError(out);
    expect(out.result).toEqual([
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
    const out = exprlist.run('$1, foo.bar, baz + $2');
    assertNoError(out);
    expect(out.result).toEqual([
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
    // TODO: should it? [] feels more natural
    const out = exprlist.run('');
    assertNoError(out);
    expect(out.result).toEqual(null);
  });
});
