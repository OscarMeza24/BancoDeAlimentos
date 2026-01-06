-- =====================================================
-- FIX: Corregir recursión infinita en políticas RLS de profiles
-- =====================================================
-- Este script corrige el error de "infinite recursion detected in policy for relation 'profiles'"
-- =====================================================

-- Primero, eliminamos las políticas problemáticas
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Solo administradores gestionan categorías" ON food_categories;
DROP POLICY IF EXISTS "Administradores gestionan todos los alimentos" ON food_items;
DROP POLICY IF EXISTS "Administradores gestionan todas las solicitudes" ON food_requests;
DROP POLICY IF EXISTS "Administradores pueden crear campañas" ON campaigns;
DROP POLICY IF EXISTS "Administradores y creadores pueden actualizar campañas" ON campaigns;
DROP POLICY IF EXISTS "Administradores pueden ver todas las donaciones" ON monetary_donations;
DROP POLICY IF EXISTS "Administradores gestionan registros de voluntarios" ON volunteer_registrations;
DROP POLICY IF EXISTS "Administradores gestionan todos los eventos" ON volunteer_events;
DROP POLICY IF EXISTS "Administradores pueden ver todas las notificaciones" ON notifications;

-- =====================================================
-- SOLUCIÓN: Usar auth.jwt() en lugar de consultar profiles
-- =====================================================

-- PROFILES: Los administradores pueden ver todos los perfiles
CREATE POLICY "Los administradores pueden ver todos los perfiles" ON profiles
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- FOOD_CATEGORIES: Solo administradores pueden gestionar categorías
CREATE POLICY "Solo administradores gestionan categorías" ON food_categories
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- FOOD_ITEMS: Administradores pueden gestionar todos los alimentos
CREATE POLICY "Administradores gestionan todos los alimentos" ON food_items
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- FOOD_REQUESTS: Administradores pueden gestionar todas las solicitudes
CREATE POLICY "Administradores gestionan todas las solicitudes" ON food_requests
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- CAMPAIGNS: Los administradores pueden crear campañas
CREATE POLICY "Administradores pueden crear campañas" ON campaigns
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- CAMPAIGNS: Los administradores y creadores pueden actualizar campañas
CREATE POLICY "Administradores y creadores pueden actualizar campañas" ON campaigns
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- MONETARY_DONATIONS: Administradores pueden ver todas las donaciones
CREATE POLICY "Administradores pueden ver todas las donaciones" ON monetary_donations
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- VOLUNTEER_REGISTRATIONS: Administradores pueden gestionar todos los registros
CREATE POLICY "Administradores gestionan registros de voluntarios" ON volunteer_registrations
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- VOLUNTEER_EVENTS: Administradores pueden gestionar todos los eventos (si existe esta política)
DROP POLICY IF EXISTS "Administradores gestionan todos los eventos" ON volunteer_events;
CREATE POLICY "Administradores gestionan todos los eventos" ON volunteer_events
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- NOTIFICATIONS: Administradores pueden ver todas las notificaciones (si existe esta política)
DROP POLICY IF EXISTS "Administradores pueden ver todas las notificaciones" ON notifications;
CREATE POLICY "Administradores pueden ver todas las notificaciones" ON notifications
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Este script usa auth.jwt() -> 'user_metadata' ->> 'role' en lugar de
-- consultar la tabla profiles, evitando así la recursión infinita.
-- El rol debe estar almacenado en el JWT del usuario durante el registro.
