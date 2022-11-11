# Mission

Make a data access library that is easy to adopt, low-maintenance, and provides powerful querying across a distributed and heterogeneous data layer.

# Vision

With ARQL, complex applications will be fast to develop and change. Analysts will have immediate access to the entirety of a company's data without being blocked by developers needing to write an ETL pipeline.

# Strategy

## MVP

Build an open-source and loosely coupled set of libraries that can make useful queries against data stored by some of the most popular databases used by Nodejs applications.

MVP looks like:

- clear and simple query language
- stable support for 2 or 3 of the most popular databases
- good documentation
- good educational tools (e.g. playground)
- proof of value in an external application
- performance benchmarks

## Post-MVP

Build a community based on the shared mission, and develop broad support for many data stores.

Add features to the language to support broader use, including possibly graph joins, mutations and subscriptions.

Reassess!

# Goals

- Reach MVP
- Github stars? Commercial adoption?? TODO

# Roadmap

## Q4 2022

- Core ARQL engine
- Alpha release
- PostgreSQL and MongoDB support
- Query builder (try similar interface to postgres.js)
- Decide on and implement a standard library of operators, functions, and transforms that will meet most common use cases

## Q1 2022

- Third data source support (redis?)
- Refine documentation and educational tools
- Example application with dashboard and list view
- Performance benchmarks
- MVP?

## Backlog

- Stream data through the collector (rather than using big arrays)
- Make the collector calculate how to resolve an expression once rather than for every row
- Graph fields
- Mutations
- Transactions
- Permissioning
- Delegator query rewriting for optimisation
- Underlying database statistics awareness?
