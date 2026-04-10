-- ============================================================================
-- RECREATE DATABASE: Solution ultime pour les problèmes de types bytea
-- ============================================================================
-- ATTENTION: Cette commande supprime TOUTES les données !
-- À utiliser seulement si les corrections partielles ne suffisent pas

-- 1. SUPPRIMER LES TABLES (dans l'ordre des dépendances)
DROP TABLE IF EXISTS exam_votes CASCADE;
DROP TABLE IF EXISTS exam_comments CASCADE;
DROP TABLE IF EXISTS exam_reports CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS professor_profiles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. RECREER LES TABLES AVEC LES BONS TYPES
-- (Hibernate va recréer automatiquement avec ddl-auto=update)

-- ============================================================================
-- ALTERNATIVE MOINS RADICALE: Corriger seulement les colonnes problématiques
-- ============================================================================

-- Vérifier d'abord l'état actuel
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('groups', 'courses', 'exams')
  AND column_name IN ('major', 'name', 'description', 'title', 'instructor_name')
ORDER BY table_name, column_name;

-- Corriger seulement les colonnes en bytea
-- GROUPS
DO $$
DECLARE
    col RECORD;
BEGIN
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'groups'
          AND column_name IN ('major', 'name', 'description')
          AND data_type = 'bytea'
    LOOP
        EXECUTE format('ALTER TABLE groups ALTER COLUMN %I TYPE TEXT USING %I::TEXT', col.column_name, col.column_name);
    END LOOP;
END $$;

-- COURSES
DO $$
DECLARE
    col RECORD;
BEGIN
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'courses'
          AND column_name IN ('major', 'title', 'description', 'instructor_name', 'code', 'objectives', 'prerequisites')
          AND data_type = 'bytea'
    LOOP
        EXECUTE format('ALTER TABLE courses ALTER COLUMN %I TYPE TEXT USING %I::TEXT', col.column_name, col.column_name);
    END LOOP;
END $$;

-- EXAMS
DO $$
DECLARE
    col RECORD;
BEGIN
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'exams'
          AND column_name IN ('title', 'description', 'academic_year')
          AND data_type = 'bytea'
    LOOP
        EXECUTE format('ALTER TABLE exams ALTER COLUMN %I TYPE TEXT USING %I::TEXT', col.column_name, col.column_name);
    END LOOP;
END $$;

-- Vérifier après correction
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('groups', 'courses', 'exams')
  AND column_name IN ('major', 'name', 'description', 'title', 'instructor_name', 'academic_year')
ORDER BY table_name, column_name;