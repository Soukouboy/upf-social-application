-- ============================================================================
-- FIX: Convert BYTEA columns to TEXT/VARCHAR in PostgreSQL
-- ============================================================================
-- Ce script corrige les colonnes mal typées en bytea au lieu de text/varchar
-- qui causent des erreurs "function lower(bytea) does not exist"

-- ============================================================================
-- TABLE: groups
-- ============================================================================
ALTER TABLE groups ALTER COLUMN major TYPE VARCHAR(100) USING major::TEXT;
ALTER TABLE groups ALTER COLUMN name TYPE VARCHAR(100) USING name::TEXT;
ALTER TABLE groups ALTER COLUMN description TYPE VARCHAR(500) USING description::TEXT;

-- ============================================================================
-- TABLE: courses
-- ============================================================================
ALTER TABLE courses ALTER COLUMN major TYPE VARCHAR(100) USING major::TEXT;
ALTER TABLE courses ALTER COLUMN title TYPE VARCHAR(200) USING title::TEXT;
ALTER TABLE courses ALTER COLUMN description TYPE VARCHAR(2000) USING description::TEXT;
ALTER TABLE courses ALTER COLUMN instructor_name TYPE VARCHAR(150) USING instructor_name::TEXT;
ALTER TABLE courses ALTER COLUMN code TYPE VARCHAR(20) USING code::TEXT;
ALTER TABLE courses ALTER COLUMN objectives TYPE VARCHAR(1000) USING objectives::TEXT;
ALTER TABLE courses ALTER COLUMN prerequisites TYPE VARCHAR(1000) USING prerequisites::TEXT;

-- ============================================================================
-- TABLE: exams
-- ============================================================================
ALTER TABLE exams ALTER COLUMN title TYPE TEXT USING title::TEXT;
ALTER TABLE exams ALTER COLUMN academic_year TYPE VARCHAR(20) USING academic_year::TEXT;
ALTER TABLE exams ALTER COLUMN description TYPE TEXT USING description::TEXT;

-- ============================================================================
-- VERIFICATION: Vérifier les types après correction
-- ============================================================================
-- \d groups
-- \d courses
-- \d exams
-- Les colonnes major, name, description, title, etc. doivent être en character varying ou text, pas en bytea
