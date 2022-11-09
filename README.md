# <img src="./ARQL.svg" alt="ARQL Logo" style="max-width: 40px;"> ARQL

ARQL (Abstract Relational Query Language) is an abstraction layer that reads data from multiple databases and external APIs, providing a uniform but flexible query interface.

Get powerful access to your data with minimal setup:

```ts
import { collectorConfig } from '@arql/stdlib-collector';
import { transforms, functions, opMap } from '@arql/stdlib-definitions';
import {
  transforms as pgTransforms,
  functions as pgFunctions,
} from '@arql/stdlib-postgresql';

import { PostgreSQL } from '@arql/source-postgresql';

// create a data source
const source = new PostgreSQL({
  models: [], // automatically retrieves schema if left empty
  transforms: pgTransforms,
  functions: pgFunctions,
  connectionVariables, //: <POSTGRES CONNECTION SETTINGS>,
});
await source.init();

// configure ARQL
const run = runner({
  contextualiserConfig: {
    models: new Map(source.models.map((m) => [m.name, m])),
    transforms: [...transforms],
    functions: [...functions],
    opMap,
  },
  collectorConfig,
});

// run queries
const results = await run(
  `
users | filter(first_name = $1) {
  surname: last_name
}`,
  ['Joe']
);
// expect [{surname: 'Blogs'}] if the "users" table in postgres contains record {"first_name": "Joe", "last_name": "Blogs"}
```

## Benefits

**Abstract**

ARQL creates a separation between your application and the query languages understood by the underlying database, decoupling the layers and making it easier than ever to switch out database technologies.

**Relational**

While data is commonly stored in key-value, document, or graph databases, it's often most natural for application developers and business analysts to want to ask relational questions of their data.

"How many users had orders fulfilled in July" should be easy to query without having to understand the underlying architecture.

**Configurable**

The best abstraction is one that rarely needs to be broken out of, but is easy to do if necessary. Nothing stops direct access to an underlying data store, and the ARQL standard libraries for operations, functions, and transforms are easy to extend, modify, or switch out.

If a data source isn't supported, add a basic implementation without support for operators/functions/transforms. Any implementations the source is missing will be processed in Javascript by ARQL's collector library.

**Low development cost**

No more writing individual resolvers for each data model. If something is added to the data layer, update the source and it will be instantly accessible.

**Expressive**

ARQL makes it easy to write complex queries and expressions and to format the responses flexibly - far clearer and more powerfully than other HTTP-friendly alternatives like GraphQL or REST with filters in query parameters.

**Injection-resistant**

ARQL queries are parameterised: there's no way of writing strings, numbers, or booleans directly in the query. This makes it easy to guard against injection vulnerabilities.

## Language fundamentals

### Field

A key-value pair is called a **field**: e.g. `name: "Joe"`

### Record

A **record** is a set of fields.

### Shape

A **shape** is the common interface for a set of records. It consists of keys that are accessible on the records and the data types of the associated values.

### Model

The most basic building block of any query is a **model**, which provides access to a set of records outside ARQL.

### Source

The database, api, or wherever else the data is accessible outside ARQL is its **source**. Several models can belong to one source.

### Collection

A **collection** is an intermediate structure of the data containing a set of records. Collections consist of an inner collection (which could be a model or another intermediate collection) and

### Transform

A **transform** is used to convert the data from one or more collections into another. Common examples include filter, sort, and join.

### Reshape

A special kind of transform is the **reshape**, which can be used to declare the output shape in terms of the input shape.

### Expressions

**Expressions** combine logic and values and consist of:

- **Parameters** are used to represent constant values supplied alongside the query
- **Operators** are used to combine other expressions: e.g. "equals", "or", "minus"
- **Functions** are used to transform other expressions: e.g. "upperCase(users.first_name)". These can have their behaviour modified by chaining "modifiers" on: e.g. "count(users.id)" vs "count.distinct(users.id)"

## Writing queries

Queries are generally written like a data pipeline - collections are piped through transforms and reshaped.

We're going to explore writing a query for "get the number of users called Joe who had orders fulfilled in July".

### Step 1: models

We have `users` and `orders` - we just take the model names

### Step 2: filtering

We apply a filter transform to each model. In the users case, we only want those whose first name is "Joe". We use the `|` symbol to apply a transform to a collection or model, and `$n` to reference a parameter.

```
users | filter(first_name = $1)
```

Likewise with the orders:

```
orders | filter(fulfilledAt <= $2 && fulfilledAt > $3)
```

Our list of parameters now looks like `["Joe", "01/06/2022", "01/07/2022"]`.

### Step 3: joining

We now want to cross-reference those users with those orders. First of all we put them alongside each other, and give them aliases (using the syntax `[alias]: [value]`) for brevity and clarity:

```
(
  u: users | filter(first_name = $1),
  o: orders | filter(fulfilledAt <= $2 && fulfilledAt > $3),
)
```

Next, with the knowledge that `orders.user_id` refers to `users.id`, we transform both collections together using a join transform:

```
(
  u: users | filter(first_name = $1),
  o: orders | filter(fulfilledAt <= $2 && fulfilledAt > $3),
) | join(o.user_id = u.id)
```

### Step 4: aggregating

Next, we want the number of users in the query so far. First, we want to group the records with another transform:

```
(
  u: users | filter(first_name = $1),
  o: orders | filter(fulfilledAt <= $2 && fulfilledAt > $3),
) | join(o.user_id = u.id) | group()
```

And then we want to reshape the output to count distinct userIds, using an alias like before, and a `count` function with the `distinct` modifier over the users' `id` column.

```
(
  u: users | filter(first_name = $1),
  o: orders | filter(fulfilledAt <= $2 && fulfilledAt > $3),
) | join(o.user_id = u.id) | group()
{
  nUsers: count.distinct(u.id)
}
```

Provided alongside `["Joe", "01/06/2022", "01/07/2022"]`, we'd expect an output of

```
{ nUsers: <number> } from this query.
```

## Run the playground

The playground is a manual testing ground for ARQL, where the language can be tried out and experimented with.

To start the postgres container:

```
(cd ./apps/test/ && docker compose up -d db)
```

To run the playground server:

```
npx nx run playground-server:serve
```

To run the playground UI:

```
npx nx run playground-ui:serve
```

## Run manual test app

The manual test app is a nodejs application that executes an ARQL query against postgres/local sources.

To start the postgres container:

```
(cd ./apps/test/ && docker compose up -d db)
```

To run the test command:

```
nx run test:run
```

To stop the db:

```
(cd ./apps/test/ && docker compose down --volumes)
```
