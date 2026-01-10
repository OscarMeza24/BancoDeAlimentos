-- =====================================================
-- FIX: Corregir recursión infinita y permitir creación de perfiles
-- =====================================================
-- ORDEN DE EJECUCIÓN: 3 - EJECUTAR SI HAY ERROR DE RLS EN REGISTRO
-- =====================================================
-- Este script corrige los errores:
-- 1. "new row violates row-level security policy for table 'profiles'"
-- 2. "infinite recursion detected in policy for relation 'profiles'"
-- =====================================================

-- 1. Eliminar TODAS las políticas problemáticas
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear perfil" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver perfiles públicos" ON profiles;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Los administradores pueden gestionar todos los perfiles" ON profiles;

-- 2. INSERTAR: Usuarios pueden crear su propio perfil durante registro
CREATE POLICY "Los usuarios pueden crear su propio perfil" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. SELECT: Usuarios ven su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 4. SELECT: Todos pueden ver perfiles públicos (sin recursión)
CREATE POLICY "Usuarios autenticados pueden ver perfiles públicos" ON profiles
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 5. UPDATE: Usuarios actualizan su propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. ADMINISTRADORES: Usar auth.jwt() en lugar de SELECT a profiles (SOLUCIÓN RECURSIÓN)
CREATE POLICY "Los administradores pueden gestionar todos los perfiles" ON profiles
  FOR ALL
  USING (
    -- Usar metadata del JWT en lugar de consultar profiles
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'administrador'
  );

-- 7. Verificar que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Verificar las políticas creadas
SELECT 
    policyname,
    cmd,
    CASE 
      WHEN qual IS NOT NULL THEN 'USING definido'
      ELSE 'Sin USING'
    END as using_clause,
    CASE 
      WHEN with_check IS NOT NULL THEN 'WITH CHECK definido'
      ELSE 'Sin WITH CHECK'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Resultado esperado:
-- ✅ INSERT: "Los usuarios pueden crear su propio perfil"
-- ✅ SELECT: "Los usuarios pueden ver su propio perfil" + "Usuarios autenticados pueden ver perfiles públicos"
-- ✅ UPDATE: "Los usuarios pueden actualizar su propio perfil"
-- ✅ ALL: "Los administradores pueden gestionar todos los perfiles"
-- ❌ NO debe haber consultas SELECT a profiles dentro de las políticas

COMMENT ON POLICY "Los administradores pueden gestionar todos los perfiles" ON profiles IS 
'Usa auth.jwt() metadata para evitar recursión infinita al verificar el rol de administrador';
