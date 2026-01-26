-- DATABASE SCHEMA BACKUP
-- pg_dump not available during snapshot creation
-- Please manually export from Supabase SQL Editor

-- Run these queries to export schema:

SELECT
  'CREATE TABLE ' || tablename || ' (' || E'\n' ||
  (SELECT string_agg('  ' || column_name || ' ' ||
    CASE
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMP WITH TIME ZONE'
      WHEN data_type = 'jsonb' THEN 'JSONB'
      WHEN data_type = 'integer' THEN 'INTEGER'
      WHEN data_type = 'boolean' THEN 'BOOLEAN'
      WHEN data_type = 'text' THEN 'TEXT'
      ELSE upper(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
    ',' || E'\n'
  ) FROM information_schema.columns c
   WHERE c.table_name = t.tablename AND c.table_schema = 'public') ||
  E'\n);' as create_statement
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename;

-- Export indexes
SELECT indexdef || ';' as index_statement
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename, indexname;
