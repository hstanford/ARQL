# contextualiser

This library was generated with [Nx](https://nx.dev).

## Summary

The Contextualiser's role is to take an AST (Abstract Syntax Tree) returned from the Parser
and to add knowledge of what data can be provided. It depends on the AST structure and on
the models configured. If the models are stored in different storage engines or databases
the contextualiser bubbles up which data requirements will be required to resolve data at each level.

## Building

Run `nx build contextualiser` to build the library.

## Running unit tests

Run `nx test contextualiser` to execute the unit tests via [Jest](https://jestjs.io).
