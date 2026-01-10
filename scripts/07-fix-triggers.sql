-- =====================================================
-- SCRIPT PARA CORREGIR TRIGGERS DE ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================
-- ORDEN DE EJECUCIÓN: 5 - EJECUTAR SI LOS TRIGGERS NO FUNCIONAN
-- =====================================================
-- Prerequisito: 01-create-tables.sql debe ejecutarse primero
-- SOLO ejecutar si los contadores automáticos no están funcionando
-- =====================================================

-- Función mejorada para actualizar el monto actual de campañas
-- Se ejecuta tanto en INSERT como en UPDATE
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'completada' AND NEW.campaign_id IS NOT NULL) THEN
    UPDATE campaigns
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'completada' AND OLD.status != 'completada' AND NEW.campaign_id IS NOT NULL) THEN
    UPDATE campaigns
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Eliminar trigger anterior
DROP TRIGGER IF EXISTS monetary_donations_update ON monetary_donations;

-- Crear trigger para INSERT (cuando se crea una donación completada)
DROP TRIGGER IF EXISTS monetary_donations_insert ON monetary_donations;
CREATE TRIGGER monetary_donations_insert
  AFTER INSERT ON monetary_donations
  FOR EACH ROW 
  WHEN (NEW.status = 'completada')
  EXECUTE FUNCTION public.update_campaign_amount();

-- Crear trigger para UPDATE (cuando se actualiza el status a completada)
DROP TRIGGER IF EXISTS monetary_donations_update ON monetary_donations;
CREATE TRIGGER monetary_donations_update
  AFTER UPDATE OF status ON monetary_donations
  FOR EACH ROW 
  WHEN (NEW.status = 'completada' AND OLD.status != 'completada')
  EXECUTE FUNCTION public.update_campaign_amount();

-- Verificar que los triggers de voluntarios estén correctos
-- (Estos ya deberían funcionar correctamente)

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_monetary_donations_campaign_status ON monetary_donations(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_volunteer ON event_participants(volunteer_id);

-- Función para actualizar automáticamente campañas completadas
CREATE OR REPLACE FUNCTION public.check_campaign_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si el monto actual alcanza o supera la meta, marcar como completada
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status = 'activa' AND NEW.goal_amount IS NOT NULL THEN
    NEW.status := 'completada';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para marcar campañas como completadas automáticamente
DROP TRIGGER IF EXISTS check_campaign_completion_trigger ON campaigns;
CREATE TRIGGER check_campaign_completion_trigger
  BEFORE UPDATE OF current_amount ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.check_campaign_completion();

-- Comentarios para documentación
COMMENT ON FUNCTION public.update_campaign_amount() IS 'Actualiza automáticamente el monto actual de una campaña cuando se completa una donación monetaria';
COMMENT ON FUNCTION public.update_event_volunteers_count() IS 'Actualiza automáticamente el contador de voluntarios registrados en un evento';
COMMENT ON FUNCTION public.check_campaign_completion() IS 'Marca automáticamente una campaña como completada cuando alcanza su meta';
