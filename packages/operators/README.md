# operators

This library was generated with [Nx](https://nx.dev).

## Summary

The Op Resolver takes user-defined operators and turns a flat
list of symbols and values into a tree based on precedence and
arity of the operators.

Expressions start out flat e.g. ` a + b * c` = `[a, '+', b, '*', c]`

It's the Op Resolver's job to correctly break that down into the equivalent of:

```js
{
  op: '+',
  args: [a, {
    op: '*',
    args: [b, c]
  }]
}
```

## Building

Run `nx build operators` to build the library.

## Running unit tests

Run `nx test operators` to execute the unit tests via [Jest](https://jestjs.io).
