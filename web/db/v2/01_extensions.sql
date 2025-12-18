-- =============================================================================
-- 01_EXTENSIONS.SQL
-- =============================================================================
-- PostgreSQL extensions required by the application.
-- Run this FIRST before any other schema files.
-- =============================================================================

-- UUID generation (gen_random_uuid is built-in for PG 13+, but ensure extension)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search with trigrams
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- Note: The following extensions may require superuser:
-- - pg_cron (for scheduled jobs) - enabled at Supabase project level
-- - postgis (for geolocation) - not currently used
-- =============================================================================
