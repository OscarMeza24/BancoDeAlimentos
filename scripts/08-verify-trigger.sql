-- =====================================================
-- SCRIPT PARA VERIFICAR Y DEPURAR TRIGGERS
-- =====================================================
-- ORDEN DE EJECUCIÓN: 6 - SCRIPT DE VERIFICACIÓN (OPCIONAL)
-- =====================================================
-- Este script NO modifica la base de datos, solo consulta información
-- Úsalo para verificar el estado de triggers y funciones
-- Puede ejecutarse en cualquier momento después del script 01
-- =====================================================

-- 1. Verificar que la función existe
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_campaign_amount'
AND n.nspname = 'public';

-- 2. Verificar que los triggers existen
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgtype & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END AS trigger_level,
    CASE t.tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'TRUNCATE'
    END AS trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'monetary_donations'
AND t.tgname LIKE '%campaign%';

-- 3. Verificar datos actuales de campañas
SELECT 
    id,
    title,
    current_amount,
    goal_amount,
    status,
    created_at
FROM campaigns
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar donaciones recientes
SELECT 
    id,
    donor_id,
    campaign_id,
    amount,
    status,
    created_at
FROM monetary_donations
ORDER BY created_at DESC
LIMIT 10;

-- 5. Prueba manual del trigger (OPCIONAL - NO EJECUTAR EN PRODUCCIÓN)
-- Descomenta las siguientes líneas para probar manualmente:

/*
-- Crear una donación de prueba
INSERT INTO monetary_donations (
    donor_id,
    campaign_id,
    amount,
    currency,
    payment_method,
    status
) VALUES (
    (SELECT id FROM profiles LIMIT 1),  -- Usa el primer perfil disponible
    (SELECT id FROM campaigns WHERE status = 'activa' LIMIT 1),  -- Primera campaña activa
    50.00,
    'USD',
    'prueba',
    'completada'
);

-- Verificar que el monto se actualizó
SELECT 
    c.id,
    c.title,
    c.current_amount,
    c.goal_amount,
    (SELECT SUM(amount) FROM monetary_donations WHERE campaign_id = c.id AND status = 'completada') as total_donado
FROM campaigns c
WHERE c.status = 'activa'
LIMIT 1;
*/
