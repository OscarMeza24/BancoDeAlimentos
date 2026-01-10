-- =====================================================
-- SCRIPT PARA VERIFICAR Y CORREGIR POLÍTICAS RLS DE CAMPAIGNS
-- =====================================================
-- ORDEN DE EJECUCIÓN: 4 - EJECUTAR SI HAY PROBLEMAS CON CAMPAIGNS
-- =====================================================
-- Prerequisito: 01-create-tables.sql debe ejecutarse primero
-- SOLO ejecutar si tienes problemas con permisos de campañas
-- =====================================================

-- 1. Ver las políticas RLS actuales de campaigns
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'campaigns';

-- 2. Eliminar políticas restrictivas si existen
DROP POLICY IF EXISTS "Solo administradores pueden actualizar campañas" ON campaigns;
DROP POLICY IF EXISTS "Solo creadores pueden actualizar campañas" ON campaigns;

-- 3. Crear política permisiva para actualizaciones de campaigns
-- Permitir que cualquier usuario autenticado pueda actualizar campañas (para donaciones)
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar campañas" ON campaigns;
CREATE POLICY "Usuarios autenticados pueden actualizar campañas" ON campaigns
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Asegurar que todos puedan ver campañas
DROP POLICY IF EXISTS "Todos pueden ver campañas" ON campaigns;
CREATE POLICY "Todos pueden ver campañas" ON campaigns
  FOR SELECT
  USING (true);

-- 5. Solo administradores pueden crear campañas
DROP POLICY IF EXISTS "Solo administradores pueden crear campañas" ON campaigns;
CREATE POLICY "Solo administradores pueden crear campañas" ON campaigns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- 6. Solo administradores pueden eliminar campañas
DROP POLICY IF EXISTS "Solo administradores pueden eliminar campañas" ON campaigns;
CREATE POLICY "Solo administradores pueden eliminar campañas" ON campaigns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- 7. Verificar las políticas después de aplicarlas
SELECT 
    policyname,
    cmd as operacion,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'Permitir'
        ELSE 'Restringir'
    END as tipo
FROM pg_policies
WHERE tablename = 'campaigns'
ORDER BY cmd, policyname;

-- 8. Hacer una prueba de actualización (descomenta para probar)
/*
-- Obtener una campaña activa
SELECT id, title, current_amount 
FROM campaigns 
WHERE status = 'activa' 
LIMIT 1;

-- Intentar actualizarla (reemplaza el ID con el real)
UPDATE campaigns 
SET current_amount = current_amount + 10
WHERE id = 'ID_DE_LA_CAMPANA_AQUI';

-- Verificar el resultado
SELECT id, title, current_amount 
FROM campaigns 
WHERE id = 'ID_DE_LA_CAMPANA_AQUI';
*/
