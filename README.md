# ![ARQL Logo](./ARQL.svg) ARQL

## Run manual test app

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
