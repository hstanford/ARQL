# delegator

This library was generated with [Nx](https://nx.dev).

## Summary

The Delegator's role is to take a query tree from the Contextualiser and to break it
up based on the data sources that are required to resolve the data at each point.

At each node in the input tree it decides if a single data source (e.g. a particular
postgres database) can resolve all the data in this branch of the tree. If so, it breaks
it off into a delegated query, which will be passed down to the resolver for that
particular data source. The rest of the tree is left for the collector to
combine from the delegated query results.

## Building

Run `nx build delegator` to build the library.

## Running unit tests

Run `nx test delegator` to execute the unit tests via [Jest](https://jestjs.io).
