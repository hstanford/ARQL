SELECT
  table_name as name,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'datatype',
      CASE
        WHEN left(udt_name :: TEXT, 1) = '_' THEN 'array'
        ELSE (
          CASE
            udt_name :: TEXT
            WHEN 'int4' THEN 'number'
            WHEN 'int8' THEN 'number'
            WHEN 'float4' THEN 'number'
            WHEN 'float8' THEN 'number'
            WHEN 'varchar' THEN 'string'
            WHEN 'text' THEN 'string'
            WHEN 'name' THEN 'string'
            WHEN 'bool' THEN 'boolean'
            WHEN 'timestamptz' THEN 'date'
            WHEN 'jsonb' THEN 'object'
            WHEN 'json' THEN 'object'
            ELSE 'unknown'
          END
        )
      END,
      'name',
      column_name :: TEXT
    )
  ) as fields
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
GROUP BY
  table_name;