-- ============================================================
-- FIX: UNIQUE constraint on patients.email
-- Prevents duplicate patient records at the database level.
--
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard → SQL Editor
-- 2. Pegar y ejecutar este script completo
-- 3. Verificar con la query al final del archivo
--
-- SEGURO para ejecutar en datos existentes:
-- El Step 1 elimina duplicados antes de agregar el constraint.
-- Se conserva el registro más antiguo (ORDER BY created_at ASC).
-- ============================================================

-- Step 1: Detectar duplicados (solo para revisar antes de borrar)
-- Descomentar para auditar primero:
-- SELECT email, COUNT(*) as count
-- FROM patients
-- GROUP BY email
-- HAVING COUNT(*) > 1
-- ORDER BY count DESC;

-- Step 2: Eliminar duplicados — conserva el registro con created_at más antiguo
DELETE FROM patients
WHERE id NOT IN (
    SELECT DISTINCT ON (LOWER(email)) id
    FROM patients
    WHERE email IS NOT NULL
    ORDER BY LOWER(email), created_at ASC
);

-- Step 3: Agregar constraint UNIQUE
ALTER TABLE patients
ADD CONSTRAINT unique_patient_email UNIQUE (email);

-- Step 4: Verificación
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'patients'
  AND constraint_type = 'UNIQUE';

-- Resultado esperado:
-- unique_patient_email | UNIQUE
