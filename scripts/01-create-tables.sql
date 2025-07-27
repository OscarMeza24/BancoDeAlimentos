-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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
CREATE TABLE food_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos/alimentos
CREATE TABLE food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES food_categories(id),
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de alimentos
CREATE TABLE food_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beneficiary_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  quantity_requested INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'completada')) DEFAULT 'pendiente',
  message TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de donaciones monetarias
CREATE TABLE monetary_donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_id TEXT,
  status TEXT CHECK (status IN ('pendiente', 'completada', 'fallida', 'reembolsada')) DEFAULT 'pendiente',
  campaign_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de campañas
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  current_amount DECIMAL(10, 2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('activa', 'pausada', 'completada', 'cancelada')) DEFAULT 'activa',
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de voluntarios
CREATE TABLE volunteer_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  availability TEXT,
  skills TEXT[],
  experience TEXT,
  background_check BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos de voluntariado
CREATE TABLE volunteer_events (
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
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de participación en eventos
CREATE TABLE event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES volunteer_events(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registrado', 'confirmado', 'ausente', 'completado')) DEFAULT 'registrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, volunteer_id)
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('donacion', 'solicitud', 'evento', 'campana', 'sistema')) DEFAULT 'sistema',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetary_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Cualquiera puede ver perfiles públicos" ON profiles
  FOR SELECT USING (true);

-- Políticas RLS para food_items
CREATE POLICY "Cualquiera puede ver alimentos disponibles" ON food_items
  FOR SELECT USING (status = 'disponible');

CREATE POLICY "Los donantes pueden gestionar sus alimentos" ON food_items
  FOR ALL USING (auth.uid() = donor_id);

-- Políticas RLS para food_requests
CREATE POLICY "Los usuarios pueden ver sus propias solicitudes" ON food_requests
  FOR SELECT USING (auth.uid() = beneficiary_id);

CREATE POLICY "Los donantes pueden ver solicitudes de sus alimentos" ON food_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM food_items 
      WHERE food_items.id = food_requests.food_item_id 
      AND food_items.donor_id = auth.uid()
    )
  );

CREATE POLICY "Los beneficiarios pueden crear solicitudes" ON food_requests
  FOR INSERT WITH CHECK (auth.uid() = beneficiary_id);

-- Políticas RLS para monetary_donations
CREATE POLICY "Los usuarios pueden ver sus propias donaciones" ON monetary_donations
  FOR SELECT USING (auth.uid() = donor_id);

CREATE POLICY "Los usuarios pueden crear donaciones" ON monetary_donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Políticas RLS para notifications
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
