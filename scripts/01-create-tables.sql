-- =====================================================
-- BANCO DE ALIMENTOS - SCRIPT DE BASE DE DATOS MEJORADO
-- =====================================================
-- ORDEN DE EJECUCIÓN: 1 - EJECUTAR PRIMERO
-- =====================================================
-- Este script incluye todas las tablas, políticas RLS,
-- triggers, funciones y validaciones necesarias
-- Debe ejecutarse ANTES de cualquier otro script
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  role TEXT CHECK (role IN ('donante', 'beneficiario', 'administrador', 'voluntario')) DEFAULT 'donante',
  organization_name TEXT,
  organization_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías de alimentos
CREATE TABLE IF NOT EXISTS food_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos/alimentos
CREATE TABLE IF NOT EXISTS food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES food_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'unidades',
  expiry_date DATE,
  pickup_location TEXT,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  status TEXT CHECK (status IN ('disponible', 'reservado', 'entregado', 'expirado')) DEFAULT 'disponible',
  image_url TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Índices para mejorar el rendimiento en food_items
CREATE INDEX IF NOT EXISTS idx_food_items_donor ON food_items(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_status ON food_items(status);
CREATE INDEX IF NOT EXISTS idx_food_items_location ON food_items(pickup_latitude, pickup_longitude) WHERE pickup_latitude IS NOT NULL;

-- Tabla de solicitudes de alimentos
CREATE TABLE IF NOT EXISTS food_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beneficiary_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE NOT NULL,
  quantity_requested INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'completada')) DEFAULT 'pendiente',
  message TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_quantity_requested CHECK (quantity_requested > 0)
);

-- Índices para food_requests
CREATE INDEX IF NOT EXISTS idx_food_requests_beneficiary ON food_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_food_requests_food_item ON food_requests(food_item_id);
CREATE INDEX IF NOT EXISTS idx_food_requests_status ON food_requests(status);

-- Tabla de campañas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  current_amount DECIMAL(10, 2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('activa', 'pausada', 'completada', 'cancelada')) DEFAULT 'activa',
  image_url TEXT,
  category TEXT CHECK (category IN ('alimentos', 'emergencia', 'educacion', 'salud', 'otro')) DEFAULT 'alimentos',
  target_organization TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amounts CHECK (goal_amount >= 0 AND current_amount >= 0)
);

-- Índices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_location ON campaigns(latitude, longitude) WHERE latitude IS NOT NULL;

-- Tabla de donaciones monetarias
CREATE TABLE IF NOT EXISTS monetary_donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_id TEXT,
  status TEXT CHECK (status IN ('pendiente', 'completada', 'fallida', 'reembolsada')) DEFAULT 'pendiente',
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_donation_amount CHECK (amount > 0)
);

-- Índices para monetary_donations
CREATE INDEX IF NOT EXISTS idx_monetary_donations_donor ON monetary_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_monetary_donations_campaign ON monetary_donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_monetary_donations_status ON monetary_donations(status);

-- Tabla de registros de voluntarios
CREATE TABLE IF NOT EXISTS volunteer_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  availability TEXT,
  skills TEXT[],
  experience TEXT,
  background_check BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para volunteer_registrations
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_volunteer ON volunteer_registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_status ON volunteer_registrations(status);

-- Tabla de eventos de voluntariado
CREATE TABLE IF NOT EXISTS volunteer_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_volunteers INTEGER,
  registered_volunteers INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('programado', 'en_curso', 'completado', 'cancelado')) DEFAULT 'programado',
  category TEXT CHECK (category IN ('general', 'recoleccion', 'distribucion', 'capacitacion', 'limpieza', 'otro')) DEFAULT 'general',
  required_materials TEXT,
  meeting_point TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_max_volunteers CHECK (max_volunteers IS NULL OR max_volunteers > 0),
  CONSTRAINT valid_registered_count CHECK (registered_volunteers >= 0)
);

-- Índices para volunteer_events
CREATE INDEX IF NOT EXISTS idx_volunteer_events_date ON volunteer_events(event_date);
CREATE INDEX IF NOT EXISTS idx_volunteer_events_status ON volunteer_events(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_events_created_by ON volunteer_events(created_by);
CREATE INDEX IF NOT EXISTS idx_volunteer_events_category ON volunteer_events(category);

-- Tabla de participación en eventos
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES volunteer_events(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('registrado', 'confirmado', 'ausente', 'completado')) DEFAULT 'registrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, volunteer_id)
);

-- Índices para event_participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_volunteer ON event_participants(volunteer_id);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('donacion', 'solicitud', 'evento', 'campana', 'sistema')) DEFAULT 'sistema',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donante')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at en tablas relevantes
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
CREATE TRIGGER handle_updated_at_profiles 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_food_items ON food_items;
CREATE TRIGGER handle_updated_at_food_items 
  BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_food_requests ON food_requests;
CREATE TRIGGER handle_updated_at_food_requests 
  BEFORE UPDATE ON food_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función para actualizar el contador de voluntarios en eventos
CREATE OR REPLACE FUNCTION public.update_event_volunteers_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE volunteer_events
    SET registered_volunteers = registered_volunteers + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE volunteer_events
    SET registered_volunteers = GREATEST(0, registered_volunteers - 1)
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para actualizar contador de voluntarios
DROP TRIGGER IF EXISTS event_participants_insert ON event_participants;
CREATE TRIGGER event_participants_insert
  AFTER INSERT ON event_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_event_volunteers_count();

DROP TRIGGER IF EXISTS event_participants_delete ON event_participants;
CREATE TRIGGER event_participants_delete
  AFTER DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_event_volunteers_count();

-- Función para actualizar el monto actual de campañas
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completada' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para actualizar monto de campañas
DROP TRIGGER IF EXISTS monetary_donations_update ON monetary_donations;
CREATE TRIGGER monetary_donations_update
  AFTER UPDATE OF status ON monetary_donations
  FOR EACH ROW 
  WHEN (NEW.status = 'completada' AND OLD.status != 'completada')
  EXECUTE FUNCTION public.update_campaign_amount();

-- Función para verificar que la cantidad solicitada no exceda la disponible
CREATE OR REPLACE FUNCTION public.check_food_request_quantity()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  available_quantity INTEGER;
BEGIN
  SELECT quantity INTO available_quantity
  FROM food_items
  WHERE id = NEW.food_item_id;

  IF NEW.quantity_requested > available_quantity THEN
    RAISE EXCEPTION 'La cantidad solicitada (%) excede la cantidad disponible (%)', 
      NEW.quantity_requested, available_quantity;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para validar cantidad en solicitudes
DROP TRIGGER IF EXISTS check_food_request_quantity_trigger ON food_requests;
CREATE TRIGGER check_food_request_quantity_trigger
  BEFORE INSERT OR UPDATE ON food_requests
  FOR EACH ROW EXECUTE FUNCTION public.check_food_request_quantity();

-- Función para marcar alimentos como expirados automáticamente
CREATE OR REPLACE FUNCTION public.mark_expired_food_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE food_items
  SET status = 'expirado'
  WHERE expiry_date < CURRENT_DATE 
    AND status = 'disponible';
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetary_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Los usuarios pueden crear su propio perfil durante el registro
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON profiles;
CREATE POLICY "Los usuarios pueden crear su propio perfil" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Cualquiera autenticado puede ver perfiles públicos básicos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver perfiles públicos" ON profiles;
CREATE POLICY "Usuarios autenticados pueden ver perfiles públicos" ON profiles
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Los administradores pueden ver todos los perfiles (SIN RECURSIÓN)
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Los administradores pueden gestionar todos los perfiles" ON profiles;
CREATE POLICY "Los administradores pueden gestionar todos los perfiles" ON profiles
  FOR ALL
  USING (
    -- Usar JWT metadata en lugar de SELECT a profiles para evitar recursión
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'administrador'
  );

-- =====================================================
-- POLÍTICAS RLS PARA FOOD_CATEGORIES
-- =====================================================

-- Todos pueden ver las categorías
DROP POLICY IF EXISTS "Cualquiera puede ver categorías" ON food_categories;
CREATE POLICY "Cualquiera puede ver categorías" ON food_categories
  FOR SELECT 
  USING (true);

-- Solo administradores pueden gestionar categorías
DROP POLICY IF EXISTS "Solo administradores gestionan categorías" ON food_categories;
CREATE POLICY "Solo administradores gestionan categorías" ON food_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA FOOD_ITEMS
-- =====================================================

-- Todos pueden ver alimentos disponibles
DROP POLICY IF EXISTS "Cualquiera puede ver alimentos disponibles" ON food_items;
CREATE POLICY "Cualquiera puede ver alimentos disponibles" ON food_items
  FOR SELECT 
  USING (status = 'disponible' OR auth.uid() = donor_id);

-- Los donantes pueden crear alimentos
DROP POLICY IF EXISTS "Los donantes pueden crear alimentos" ON food_items;
CREATE POLICY "Los donantes pueden crear alimentos" ON food_items
  FOR INSERT 
  WITH CHECK (auth.uid() = donor_id);

-- Los donantes pueden actualizar sus propios alimentos
DROP POLICY IF EXISTS "Los donantes pueden actualizar sus alimentos" ON food_items;
CREATE POLICY "Los donantes pueden actualizar sus alimentos" ON food_items
  FOR UPDATE 
  USING (auth.uid() = donor_id);

-- Los donantes pueden eliminar sus propios alimentos
DROP POLICY IF EXISTS "Los donantes pueden eliminar sus alimentos" ON food_items;
CREATE POLICY "Los donantes pueden eliminar sus alimentos" ON food_items
  FOR DELETE 
  USING (auth.uid() = donor_id);

-- Administradores pueden gestionar todos los alimentos
DROP POLICY IF EXISTS "Administradores gestionan todos los alimentos" ON food_items;
CREATE POLICY "Administradores gestionan todos los alimentos" ON food_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA FOOD_REQUESTS
-- =====================================================

-- Los beneficiarios pueden ver sus propias solicitudes
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias solicitudes" ON food_requests;
CREATE POLICY "Los usuarios pueden ver sus propias solicitudes" ON food_requests
  FOR SELECT 
  USING (auth.uid() = beneficiary_id);

-- Los donantes pueden ver solicitudes de sus alimentos
DROP POLICY IF EXISTS "Los donantes pueden ver solicitudes de sus alimentos" ON food_requests;
CREATE POLICY "Los donantes pueden ver solicitudes de sus alimentos" ON food_requests
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM food_items 
      WHERE food_items.id = food_requests.food_item_id 
        AND food_items.donor_id = auth.uid()
    )
  );

-- Los beneficiarios pueden crear solicitudes
DROP POLICY IF EXISTS "Los beneficiarios pueden crear solicitudes" ON food_requests;
CREATE POLICY "Los beneficiarios pueden crear solicitudes" ON food_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = beneficiary_id);

-- Los donantes pueden actualizar el estado de solicitudes de sus alimentos
DROP POLICY IF EXISTS "Los donantes pueden actualizar solicitudes de sus alimentos" ON food_requests;
CREATE POLICY "Los donantes pueden actualizar solicitudes de sus alimentos" ON food_requests
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM food_items 
      WHERE food_items.id = food_requests.food_item_id 
        AND food_items.donor_id = auth.uid()
    )
  );

-- Administradores pueden gestionar todas las solicitudes
DROP POLICY IF EXISTS "Administradores gestionan todas las solicitudes" ON food_requests;
CREATE POLICY "Administradores gestionan todas las solicitudes" ON food_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA CAMPAIGNS
-- =====================================================

-- Todos pueden ver campañas activas
DROP POLICY IF EXISTS "Todos pueden ver campañas" ON campaigns;
CREATE POLICY "Todos pueden ver campañas" ON campaigns
  FOR SELECT 
  USING (true);

-- Los administradores pueden crear campañas
DROP POLICY IF EXISTS "Administradores pueden crear campañas" ON campaigns;
CREATE POLICY "Administradores pueden crear campañas" ON campaigns
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Los administradores y creadores pueden actualizar campañas
DROP POLICY IF EXISTS "Administradores y creadores pueden actualizar campañas" ON campaigns;
CREATE POLICY "Administradores y creadores pueden actualizar campañas" ON campaigns
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA MONETARY_DONATIONS
-- =====================================================

-- Los usuarios pueden ver sus propias donaciones
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias donaciones" ON monetary_donations;
CREATE POLICY "Los usuarios pueden ver sus propias donaciones" ON monetary_donations
  FOR SELECT 
  USING (auth.uid() = donor_id);

-- Los usuarios pueden crear donaciones
DROP POLICY IF EXISTS "Los usuarios pueden crear donaciones" ON monetary_donations;
CREATE POLICY "Los usuarios pueden crear donaciones" ON monetary_donations
  FOR INSERT 
  WITH CHECK (auth.uid() = donor_id);

-- Administradores pueden ver todas las donaciones
DROP POLICY IF EXISTS "Administradores pueden ver todas las donaciones" ON monetary_donations;
CREATE POLICY "Administradores pueden ver todas las donaciones" ON monetary_donations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA VOLUNTEER_REGISTRATIONS
-- =====================================================

-- Los voluntarios pueden ver su propio registro
DROP POLICY IF EXISTS "Los voluntarios pueden ver su registro" ON volunteer_registrations;
CREATE POLICY "Los voluntarios pueden ver su registro" ON volunteer_registrations
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Los voluntarios pueden crear su registro
DROP POLICY IF EXISTS "Los voluntarios pueden crear su registro" ON volunteer_registrations;
CREATE POLICY "Los voluntarios pueden crear su registro" ON volunteer_registrations
  FOR INSERT 
  WITH CHECK (auth.uid() = volunteer_id);

-- Los voluntarios pueden actualizar su registro
DROP POLICY IF EXISTS "Los voluntarios pueden actualizar su registro" ON volunteer_registrations;
CREATE POLICY "Los voluntarios pueden actualizar su registro" ON volunteer_registrations
  FOR UPDATE 
  USING (auth.uid() = volunteer_id);

-- Administradores pueden gestionar todos los registros
DROP POLICY IF EXISTS "Administradores gestionan registros de voluntarios" ON volunteer_registrations;
CREATE POLICY "Administradores gestionan registros de voluntarios" ON volunteer_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA VOLUNTEER_EVENTS
-- =====================================================

-- Todos pueden ver eventos programados
DROP POLICY IF EXISTS "Todos pueden ver eventos" ON volunteer_events;
CREATE POLICY "Todos pueden ver eventos" ON volunteer_events
  FOR SELECT 
  USING (true);

-- Voluntarios y administradores pueden crear eventos
DROP POLICY IF EXISTS "Voluntarios y administradores pueden crear eventos" ON volunteer_events;
CREATE POLICY "Voluntarios y administradores pueden crear eventos" ON volunteer_events
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
        AND role IN ('voluntario', 'administrador')
    )
  );

-- Los creadores y administradores pueden actualizar eventos
DROP POLICY IF EXISTS "Creadores y administradores pueden actualizar eventos" ON volunteer_events;
CREATE POLICY "Creadores y administradores pueden actualizar eventos" ON volunteer_events
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA EVENT_PARTICIPANTS
-- =====================================================

-- Los voluntarios pueden ver sus participaciones
DROP POLICY IF EXISTS "Los voluntarios pueden ver sus participaciones" ON event_participants;
CREATE POLICY "Los voluntarios pueden ver sus participaciones" ON event_participants
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Los organizadores pueden ver participantes de sus eventos
DROP POLICY IF EXISTS "Organizadores pueden ver participantes de sus eventos" ON event_participants;
CREATE POLICY "Organizadores pueden ver participantes de sus eventos" ON event_participants
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_events 
      WHERE volunteer_events.id = event_participants.event_id 
        AND volunteer_events.created_by = auth.uid()
    )
  );

-- Los voluntarios pueden registrarse en eventos
DROP POLICY IF EXISTS "Los voluntarios pueden registrarse en eventos" ON event_participants;
CREATE POLICY "Los voluntarios pueden registrarse en eventos" ON event_participants
  FOR INSERT 
  WITH CHECK (auth.uid() = volunteer_id);

-- Los voluntarios pueden cancelar su participación
DROP POLICY IF EXISTS "Los voluntarios pueden cancelar su participación" ON event_participants;
CREATE POLICY "Los voluntarios pueden cancelar su participación" ON event_participants
  FOR DELETE 
  USING (auth.uid() = volunteer_id);

-- Organizadores pueden actualizar estado de participantes
DROP POLICY IF EXISTS "Organizadores pueden actualizar participantes" ON event_participants;
CREATE POLICY "Organizadores pueden actualizar participantes" ON event_participants
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_events 
      WHERE volunteer_events.id = event_participants.event_id 
        AND volunteer_events.created_by = auth.uid()
    )
  );

-- Administradores pueden gestionar todas las participaciones
DROP POLICY IF EXISTS "Administradores gestionan participaciones" ON event_participants;
CREATE POLICY "Administradores gestionan participaciones" ON event_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA NOTIFICATIONS
-- =====================================================

-- Los usuarios pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias notificaciones" ON notifications;
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias notificaciones" ON notifications;
CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- El sistema puede crear notificaciones para cualquier usuario
DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON notifications;
CREATE POLICY "Sistema puede crear notificaciones" ON notifications
  FOR INSERT 
  WITH CHECK (true);

-- Los usuarios pueden eliminar sus propias notificaciones
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus notificaciones" ON notifications;
CREATE POLICY "Los usuarios pueden eliminar sus notificaciones" ON notifications
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfiles de usuario con información personal y rol';
COMMENT ON TABLE food_categories IS 'Categorías para clasificar alimentos';
COMMENT ON TABLE food_items IS 'Productos alimenticios disponibles para donación';
COMMENT ON TABLE food_requests IS 'Solicitudes de alimentos por parte de beneficiarios';
COMMENT ON TABLE campaigns IS 'Campañas de recaudación de fondos';
COMMENT ON TABLE monetary_donations IS 'Donaciones monetarias realizadas por usuarios';
COMMENT ON TABLE volunteer_registrations IS 'Registro de voluntarios en el sistema';
COMMENT ON TABLE volunteer_events IS 'Eventos de voluntariado organizados';
COMMENT ON TABLE event_participants IS 'Participación de voluntarios en eventos';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios';

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Este script incluye:
-- ✅ Todas las tablas necesarias
-- ✅ Índices para optimizar consultas
-- ✅ Constraints y validaciones
-- ✅ Funciones y triggers automáticos
-- ✅ Políticas RLS completas para todos los roles
-- ✅ Referencias foráneas con acciones en cascada
-- ✅ Comentarios de documentación
-- =====================================================
