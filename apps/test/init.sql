CREATE TABLE test (foo TEXT, bar TEXT);

INSERT INTO
  test (foo, bar)
VALUES
  ('Joe', 'Blogs'),
  ('John', 'Doe');

CREATE TABLE other_users (first_name TEXT, last_name TEXT);

INSERT INTO
  other_users (first_name, last_name)
VALUES
  ('Mary', 'Blogs'),
  ('Jane', 'Doe');

SELECT
  "join".*
FROM
  (
    SELECT
      "other_users"."first_name" AS "first_name",
      "test"."foo" AS "foo",
      "test"."bar" AS "bar"
    FROM
      (
        SELECT
        FROM
          (
            SELECT
              "test"."foo" AS "foo",
              "test"."bar" AS "bar"
            FROM
              (
                SELECT
                  "test"."foo" AS "foo",
                  "test"."bar" AS "bar"
                FROM
                  (
                    SELECT
                      "test"."foo" AS "foo",
                      "test"."bar" AS "bar"
                    FROM
                      "test"
                  ) "test"
              ) "test"
          ) "test"
          INNER JOIN (
            SELECT
              "other_users"."first_name" AS "first_name",
              "other_users"."last_name" AS "last_name"
            FROM
              (
                SELECT
                  "other_users"."first_name" AS "first_name",
                  "other_users"."last_name" AS "last_name"
                FROM
                  (
                    SELECT
                      "other_users"."first_name" AS "first_name",
                      "other_users"."last_name" AS "last_name"
                    FROM
                      "other_users"
                  ) "other_users"
              ) "other_users"
          ) "other_users" ON ("test"."bar" = "other_users"."last_name")
      ) "test"
  ) "join"