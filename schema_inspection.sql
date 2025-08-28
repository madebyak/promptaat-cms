    -- Comprehensive Supabase Schema Inspection SQL

    -- 1. Get all tables in the database
    SELECT 
    table_schema,
    table_name,
    table_type
    FROM 
    information_schema.tables
    WHERE 
    table_schema = 'public'
    ORDER BY 
    table_name;

    -- 2. Get detailed information about columns for each table
    SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length,
    udt_name
    FROM 
    information_schema.columns
    WHERE 
    table_schema = 'public'
    ORDER BY 
    table_name, ordinal_position;

    -- 3. Get all primary keys
    SELECT
    tc.table_schema, 
    tc.table_name, 
    kc.column_name 
    FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kc
        ON kc.table_name = tc.table_name
        AND kc.table_schema = tc.table_schema
        AND kc.constraint_name = tc.constraint_name
    WHERE 
    tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    ORDER BY 
    tc.table_schema, 
    tc.table_name;

    -- 4. Get all foreign keys
    SELECT
    tc.table_schema, 
    tc.table_name AS table_name, 
    kcu.column_name AS column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
    FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    ORDER BY 
    tc.table_schema, 
    tc.table_name;

    -- 5. Get all unique constraints
    SELECT
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name
    FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON kcu.table_name = tc.table_name
        AND kcu.table_schema = tc.table_schema
        AND kcu.constraint_name = tc.constraint_name
    WHERE 
    tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    ORDER BY 
    tc.table_schema, 
    tc.table_name,
    tc.constraint_name,
    kcu.ordinal_position;

    -- 6. Get all check constraints
    SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    pg_get_constraintdef(pgc.oid) as check_definition
    FROM 
    information_schema.table_constraints tc
    JOIN pg_constraint pgc
        ON tc.constraint_name = pgc.conname
    WHERE 
    tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
    ORDER BY 
    tc.table_schema, 
    tc.table_name;

    -- 7. Get all indices
    SELECT
    tablename,
    indexname,
    indexdef
    FROM
    pg_indexes
    WHERE
    schemaname = 'public'
    ORDER BY
    tablename,
    indexname;

    -- 8. Get all sequences
    SELECT
    sequence_schema,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
    FROM
    information_schema.sequences
    WHERE
    sequence_schema = 'public'
    ORDER BY
    sequence_schema,
    sequence_name;

    -- 9. Get all triggers
    SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
    FROM
    information_schema.triggers
    WHERE
    trigger_schema = 'public'
    ORDER BY
    event_object_table,
    trigger_name;

    -- 10. Get all views
    SELECT
    table_schema,
    table_name,
    view_definition
    FROM
    information_schema.views
    WHERE
    table_schema = 'public'
    ORDER BY
    table_schema,
    table_name;

    -- 11. Get all functions
    SELECT
    routine_schema,
    routine_name,
    routine_type,
    data_type,
    external_language,
    routine_definition
    FROM
    information_schema.routines
    WHERE
    routine_schema = 'public'
    ORDER BY
    routine_schema,
    routine_name;

    -- 12. Get RLS policies
    SELECT
    n.nspname AS schema,
    c.relname AS table,
    pol.polname AS policy,
    CASE 
        WHEN pol.polpermissive THEN 'PERMISSIVE' 
        ELSE 'RESTRICTIVE' 
    END AS permissive,
    CASE
        WHEN pol.polroles = '{0}' THEN 'PUBLIC'
        ELSE pg_catalog.array_to_string(
        ARRAY(
            SELECT rolname
            FROM pg_catalog.pg_roles
            WHERE oid = ANY(pol.polroles)
            ORDER BY 1
        ),
        ', '
        )
    END AS roles,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    pg_catalog.pg_get_expr(pol.polqual, pol.polrelid) AS expression,
    pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
    FROM
    pg_catalog.pg_policy pol
    JOIN pg_catalog.pg_class c ON c.oid = pol.polrelid
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE
    n.nspname = 'public'
    ORDER BY
    schema, "table", policy;

    -- 13. Tables with RLS enabled
    SELECT
    n.nspname AS schema,
    c.relname AS table,
    CASE
        WHEN c.relrowsecurity THEN 'enabled'
        ELSE 'disabled'
    END AS row_level_security,
    CASE
        WHEN c.relforcerowsecurity THEN 'enabled'
        ELSE 'disabled'
    END AS force_row_level_security
    FROM
    pg_catalog.pg_class c
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE
    c.relkind = 'r'
    AND n.nspname = 'public'
    ORDER BY
    schema, "table";

    -- 14. Get table comments
    SELECT
    ns.nspname AS schema_name,
    cl.relname AS table_name,
    pd.description AS table_comment
    FROM
    pg_catalog.pg_class AS cl
    INNER JOIN pg_catalog.pg_namespace AS ns ON cl.relnamespace = ns.oid
    LEFT JOIN pg_catalog.pg_description AS pd ON cl.oid = pd.objoid AND pd.objsubid = 0
    WHERE
    cl.relkind = 'r'
    AND ns.nspname = 'public'
    ORDER BY
    schema_name, table_name;

    -- 15. Get column comments
    SELECT
    ns.nspname AS schema_name,
    cl.relname AS table_name,
    attr.attname AS column_name,
    pd.description AS column_comment
    FROM
    pg_catalog.pg_class AS cl
    INNER JOIN pg_catalog.pg_namespace AS ns ON cl.relnamespace = ns.oid
    INNER JOIN pg_catalog.pg_attribute AS attr ON cl.oid = attr.attrelid
    LEFT JOIN pg_catalog.pg_description AS pd ON cl.oid = pd.objoid AND pd.objsubid = attr.attnum
    WHERE
    cl.relkind = 'r'
    AND ns.nspname = 'public'
    AND attr.attnum > 0
    AND NOT attr.attisdropped
    AND pd.description IS NOT NULL
    ORDER BY
    schema_name, table_name, attr.attnum;

    -- 16. Get extensions
    SELECT
    extname AS extension,
    extversion AS version,
    nspname AS schema,
    description
    FROM
    pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    LEFT JOIN pg_description d ON d.objoid = e.oid AND d.classoid = 'pg_extension'::regclass
    ORDER BY
    extname;

    -- 17. Compare SQL script with actual tables
    WITH md_tables AS (
    VALUES
        ('categories'),
        ('subcategories'),
        ('admins'),
        ('tools'),
        ('user_profiles'),
        ('prompts'),
        ('prompt_kits'),
        ('prompt_categories'),
        ('kit_categories'),
        ('prompt_tools'),
        ('kit_tools'),
        ('user_liked_prompts'),
        ('user_liked_kits'),
        ('prompt_reviews'),
        ('kit_reviews'),
        ('collections'),
        ('collection_prompts'),
        ('collection_kits'),
        ('change_logs'),
        ('prompt_requests')
    )
    SELECT
    t.table_name AS "Table Name",
    CASE WHEN md.column1 IS NOT NULL THEN 'Exists in both' ELSE 'Missing from documentation' END AS "Status"
    FROM
    information_schema.tables t
    LEFT JOIN md_tables md ON t.table_name = md.column1
    WHERE
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    UNION
    SELECT
    md.column1 AS "Table Name",
    CASE WHEN t.table_name IS NOT NULL THEN 'Exists in both' ELSE 'Missing in database' END AS "Status"
    FROM
    md_tables md
    LEFT JOIN information_schema.tables t ON t.table_name = md.column1 AND t.table_schema = 'public'
    ORDER BY "Table Name";

    -- 18. Database statistics
    SELECT
    relname AS "Table",
    reltuples::bigint AS "Row Count",
    pg_size_pretty(pg_total_relation_size(C.oid)) AS "Total Size",
    pg_size_pretty(pg_table_size(C.oid)) AS "Table Size",
    pg_size_pretty(pg_indexes_size(C.oid)) AS "Index Size"
    FROM
    pg_class C
    LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
    WHERE
    nspname = 'public'
    AND relkind = 'r'
    ORDER BY
    pg_total_relation_size(C.oid) DESC;
