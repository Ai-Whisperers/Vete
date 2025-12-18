-- =============================================================================
-- 01_EXTENSIONS.SQL
-- =============================================================================
-- PostgreSQL extensions required for the application.
-- These must be enabled before creating any tables.
-- =============================================================================

-- UUID generation (for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions (for password hashing in seed data)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram matching (for fuzzy search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- EXTENSIONS COMPLETE
-- =============================================================================
