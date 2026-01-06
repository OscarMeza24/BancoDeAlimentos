-- =====================================================
-- BANCO DE ALIMENTOS - DATOS INICIALES Y SEMILLAS
-- =====================================================
-- Script mejorado con datos de prueba completos
-- =====================================================

-- =====================================================
-- INSERTAR CATEGORÍAS DE ALIMENTOS
-- =====================================================

INSERT INTO food_categories (name, description, icon) VALUES
('Frutas y Verduras', 'Productos frescos, frutas y vegetales', '🥕'),
('Lácteos', 'Leche, queso, yogurt y derivados lácteos', '🥛'),
('Carnes y Proteínas', 'Carnes, pescados, huevos y proteínas', '🥩'),
('Granos y Cereales', 'Arroz, pasta, pan y cereales', '🌾'),
('Enlatados', 'Conservas y alimentos enlatados', '🥫'),
('Bebidas', 'Jugos, agua y otras bebidas', '🧃'),
('Productos de Panadería', 'Pan, pasteles y productos horneados', '🍞'),
('Condimentos y Especias', 'Sal, azúcar, especias y condimentos', '🧂'),
('Comida Preparada', 'Alimentos listos para consumir', '🍱'),
('Productos Congelados', 'Alimentos congelados', '🧊'),
('Legumbres', 'Frijoles, lentejas, garbanzos', '🫘'),
('Aceites y Grasas', 'Aceites de cocina y mantequilla', '🫒')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERTAR CAMPAÑAS DE EJEMPLO
-- =====================================================

-- Nota: created_by será NULL inicialmente y debería actualizarse
-- después de crear usuarios administradores

INSERT INTO campaigns (title, description, goal_amount, current_amount, status, start_date, end_date, image_url) VALUES
(
  'Alimenta una Familia',
  'Ayuda a proporcionar comidas nutritivas a familias necesitadas durante todo el mes. Tu donación se utilizará para comprar alimentos básicos como arroz, frijoles, aceite, y productos frescos que serán distribuidos directamente a familias en situación vulnerable.',
  5000.00,
  1250.00,
  'activa',
  NOW(),
  NOW() + INTERVAL '30 days',
  '/placeholder.svg?height=300&width=400'
),
(
  'Navidad Solidaria',
  'Campaña especial para las fiestas navideñas. Buscamos reunir fondos para proporcionar cenas navideñas completas a 200 familias, incluyendo pavo, verduras frescas, pan dulce y regalos para los niños.',
  10000.00,
  3500.00,
  'activa',
  NOW(),
  NOW() + INTERVAL '60 days',
  '/placeholder.svg?height=300&width=400'
),
(
  'Apoyo Escolar',
  'Programa de alimentación para estudiantes. Los fondos se destinarán a crear loncheras nutritivas para niños en edad escolar, asegurando que tengan la energía necesaria para aprender y desarrollarse.',
  3000.00,
  800.00,
  'activa',
  NOW(),
  NOW() + INTERVAL '90 days',
  '/placeholder.svg?height=300&width=400'
),
(
  'Emergencia Comunitaria',
  'Fondo de emergencia para responder rápidamente a situaciones de crisis en la comunidad, como desastres naturales o emergencias sanitarias que afecten el acceso a alimentos.',
  8000.00,
  2100.00,
  'activa',
  NOW(),
  NOW() + INTERVAL '120 days',
  '/placeholder.svg?height=300&width=400'
),
(
  'Banco de Alimentos Móvil',
  'Proyecto para adquirir y equipar un vehículo que permita llevar alimentos a comunidades rurales alejadas que tienen dificultad para acceder a nuestros centros de distribución.',
  15000.00,
  5500.00,
  'activa',
  NOW(),
  NOW() + INTERVAL '180 days',
  '/placeholder.svg?height=300&width=400'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- INSERTAR EVENTOS DE VOLUNTARIADO DE EJEMPLO
-- =====================================================

-- Eventos futuros
INSERT INTO volunteer_events (
  title, 
  description, 
  event_date, 
  location, 
  latitude, 
  longitude, 
  max_volunteers, 
  registered_volunteers, 
  status
) VALUES
(
  'Recolección de Alimentos - Supermercados Centro',
  'Voluntarios necesarios para recolectar donaciones de alimentos en supermercados del centro de la ciudad. Actividad ideal para familias.',
  NOW() + INTERVAL '7 days',
  'Centro Comercial Plaza Mayor, Local 123',
  19.4326,
  -99.1332,
  20,
  0,
  'programado'
),
(
  'Organización de Almacén',
  'Ayuda necesaria para clasificar y organizar los alimentos recibidos en nuestro almacén principal. Se proporcionará capacitación.',
  NOW() + INTERVAL '5 days',
  'Almacén Central - Av. Industrial 456',
  19.4270,
  -99.1320,
  15,
  0,
  'programado'
),
(
  'Distribución en Comunidad Rural',
  'Evento especial para llevar alimentos a comunidad rural. Se requiere disponibilidad de día completo. Transporte incluido.',
  NOW() + INTERVAL '14 days',
  'Comunidad San José - Salida desde oficina central',
  19.3910,
  -99.1400,
  10,
  0,
  'programado'
),
(
  'Jornada de Cocina Comunitaria',
  'Prepararemos comidas calientes para personas en situación de calle. Cocineros aficionados y profesionales bienvenidos.',
  NOW() + INTERVAL '10 days',
  'Cocina Comunitaria - Calle Solidaridad 789',
  19.4400,
  -99.1450,
  25,
  0,
  'programado'
),
(
  'Campaña de Sensibilización',
  'Voluntarios para repartir información sobre desperdicio de alimentos y promover la donación en parques y plazas públicas.',
  NOW() + INTERVAL '21 days',
  'Parque Central - Plaza de la Constitución',
  19.4326,
  -99.1332,
  30,
  0,
  'programado'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCIONES AUXILIARES PARA ADMINISTRACIÓN
-- =====================================================

-- Función para obtener estadísticas generales del sistema
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_donors', (SELECT COUNT(*) FROM profiles WHERE role = 'donante'),
    'total_beneficiaries', (SELECT COUNT(*) FROM profiles WHERE role = 'beneficiario'),
    'total_volunteers', (SELECT COUNT(*) FROM profiles WHERE role = 'voluntario'),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role = 'administrador'),
    'total_food_items', (SELECT COUNT(*) FROM food_items),
    'available_food_items', (SELECT COUNT(*) FROM food_items WHERE status = 'disponible'),
    'total_requests', (SELECT COUNT(*) FROM food_requests),
    'pending_requests', (SELECT COUNT(*) FROM food_requests WHERE status = 'pendiente'),
    'total_campaigns', (SELECT COUNT(*) FROM campaigns),
    'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE status = 'activa'),
    'total_donations', (SELECT COALESCE(SUM(amount), 0) FROM monetary_donations WHERE status = 'completada'),
    'total_events', (SELECT COUNT(*) FROM volunteer_events),
    'upcoming_events', (SELECT COUNT(*) FROM volunteer_events WHERE status = 'programado' AND event_date > NOW())
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Función para limpiar notificaciones antiguas (más de 90 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Función para crear notificación (útil para triggers y funciones)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'sistema',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- =====================================================
-- TRIGGERS ADICIONALES PARA NOTIFICACIONES AUTOMÁTICAS
-- =====================================================

-- Notificar al donante cuando hay una nueva solicitud
CREATE OR REPLACE FUNCTION public.notify_donor_new_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  donor_id UUID;
  food_name TEXT;
  beneficiary_name TEXT;
BEGIN
  -- Obtener información del donante y el alimento
  SELECT fi.donor_id, fi.name INTO donor_id, food_name
  FROM food_items fi
  WHERE fi.id = NEW.food_item_id;
  
  -- Obtener nombre del beneficiario
  SELECT full_name INTO beneficiary_name
  FROM profiles
  WHERE id = NEW.beneficiary_id;
  
  -- Crear notificación
  PERFORM create_notification(
    donor_id,
    'Nueva solicitud de alimento',
    format('%s ha solicitado tu donación: %s', COALESCE(beneficiary_name, 'Un usuario'), food_name),
    'solicitud',
    format('/alimentos/%s', NEW.food_item_id)
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_donor_new_request_trigger ON food_requests;
CREATE TRIGGER notify_donor_new_request_trigger
  AFTER INSERT ON food_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_donor_new_request();

-- Notificar al beneficiario cuando su solicitud cambia de estado
CREATE OR REPLACE FUNCTION public.notify_beneficiary_request_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  food_name TEXT;
  status_message TEXT;
BEGIN
  IF NEW.status != OLD.status THEN
    -- Obtener nombre del alimento
    SELECT name INTO food_name
    FROM food_items
    WHERE id = NEW.food_item_id;
    
    -- Construir mensaje según el estado
    CASE NEW.status
      WHEN 'aprobada' THEN
        status_message := format('Tu solicitud de "%s" ha sido aprobada', food_name);
      WHEN 'rechazada' THEN
        status_message := format('Tu solicitud de "%s" ha sido rechazada', food_name);
      WHEN 'completada' THEN
        status_message := format('Tu solicitud de "%s" se ha completado', food_name);
      ELSE
        status_message := format('Tu solicitud de "%s" ha cambiado de estado', food_name);
    END CASE;
    
    -- Crear notificación
    PERFORM create_notification(
      NEW.beneficiary_id,
      'Actualización de solicitud',
      status_message,
      'solicitud',
      format('/alimentos/%s', NEW.food_item_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_beneficiary_request_status_trigger ON food_requests;
CREATE TRIGGER notify_beneficiary_request_status_trigger
  AFTER UPDATE ON food_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_beneficiary_request_status();

-- Notificar cuando se registra un nuevo voluntario en un evento
CREATE OR REPLACE FUNCTION public.notify_event_organizer_new_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_title TEXT;
  event_creator UUID;
  volunteer_name TEXT;
BEGIN
  -- Obtener información del evento
  SELECT title, created_by INTO event_title, event_creator
  FROM volunteer_events
  WHERE id = NEW.event_id;
  
  -- Obtener nombre del voluntario
  SELECT full_name INTO volunteer_name
  FROM profiles
  WHERE id = NEW.volunteer_id;
  
  -- Crear notificación para el organizador si existe
  IF event_creator IS NOT NULL THEN
    PERFORM create_notification(
      event_creator,
      'Nuevo participante en evento',
      format('%s se ha registrado en tu evento: %s', COALESCE(volunteer_name, 'Un voluntario'), event_title),
      'evento',
      format('/eventos/%s', NEW.event_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_event_organizer_new_participant_trigger ON event_participants;
CREATE TRIGGER notify_event_organizer_new_participant_trigger
  AFTER INSERT ON event_participants
  FOR EACH ROW EXECUTE FUNCTION public.notify_event_organizer_new_participant();

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de estadísticas por categoría
CREATE OR REPLACE VIEW food_stats_by_category AS
SELECT 
  fc.name AS category_name,
  fc.icon AS category_icon,
  COUNT(fi.id) AS total_items,
  SUM(CASE WHEN fi.status = 'disponible' THEN 1 ELSE 0 END) AS available_items,
  SUM(CASE WHEN fi.status = 'reservado' THEN 1 ELSE 0 END) AS reserved_items,
  SUM(CASE WHEN fi.status = 'entregado' THEN 1 ELSE 0 END) AS delivered_items,
  SUM(fi.quantity) AS total_quantity
FROM food_categories fc
LEFT JOIN food_items fi ON fc.id = fi.category_id
GROUP BY fc.id, fc.name, fc.icon
ORDER BY total_items DESC;

-- Vista de actividad de usuarios
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.created_at,
  (SELECT COUNT(*) FROM food_items WHERE donor_id = p.id) AS total_donations,
  (SELECT COUNT(*) FROM food_requests WHERE beneficiary_id = p.id) AS total_requests,
  (SELECT COUNT(*) FROM event_participants WHERE volunteer_id = p.id) AS events_participated,
  (SELECT COALESCE(SUM(amount), 0) FROM monetary_donations 
   WHERE donor_id = p.id AND status = 'completada') AS total_money_donated
FROM profiles p
ORDER BY p.created_at DESC;

-- Vista de campañas con progreso
CREATE OR REPLACE VIEW campaigns_with_progress AS
SELECT 
  c.*,
  CASE 
    WHEN c.goal_amount > 0 THEN 
      ROUND((c.current_amount / c.goal_amount * 100)::NUMERIC, 2)
    ELSE 0 
  END AS progress_percentage,
  (SELECT COUNT(*) FROM monetary_donations 
   WHERE campaign_id = c.id AND status = 'completada') AS total_donors,
  p.full_name AS creator_name
FROM campaigns c
LEFT JOIN profiles p ON c.created_by = p.id
ORDER BY c.created_at DESC;

-- Vista de eventos próximos con detalles
CREATE OR REPLACE VIEW upcoming_events_detailed AS
SELECT 
  ve.*,
  p.full_name AS organizer_name,
  CASE 
    WHEN ve.max_volunteers IS NOT NULL THEN 
      ROUND((ve.registered_volunteers::NUMERIC / ve.max_volunteers * 100)::NUMERIC, 2)
    ELSE NULL 
  END AS capacity_percentage,
  CASE 
    WHEN ve.max_volunteers IS NOT NULL THEN 
      ve.max_volunteers - ve.registered_volunteers
    ELSE NULL 
  END AS available_spots
FROM volunteer_events ve
LEFT JOIN profiles p ON ve.created_by = p.id
WHERE ve.status = 'programado' AND ve.event_date > NOW()
ORDER BY ve.event_date ASC;

-- =====================================================
-- SCRIPT DE SEMILLAS COMPLETADO
-- =====================================================
-- Este script incluye:
-- ✅ Categorías completas de alimentos
-- ✅ Campañas de ejemplo con descripciones detalladas
-- ✅ Eventos de voluntariado variados
-- ✅ Funciones auxiliares para administración
-- ✅ Triggers para notificaciones automáticas
-- ✅ Vistas útiles para reportes y dashboards
-- =====================================================
