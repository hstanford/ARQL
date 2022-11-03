CREATE TABLE test (foo TEXT, bar TEXT, age INTEGER);

INSERT INTO
  test (foo, bar, age)
VALUES
  ('Joe', 'Blogs', 28),
  ('Joe', 'Dart', 24),
  ('John', 'Doe', 54);

CREATE TABLE other_users (first_name TEXT, last_name TEXT);

INSERT INTO
  other_users (first_name, last_name)
VALUES
  ('Mary', 'Blogs'),
  ('Jane', 'Doe');