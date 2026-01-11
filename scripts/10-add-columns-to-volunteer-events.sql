-- =====================================================
-- SCRIPT DE MIGRACIÓN: Agregar columnas a volunteer_events
-- =====================================================
-- ORDEN DE EJECUCIÓN: 10 - EJECUTAR DESPUÉS de los scripts 01-09
-- =====================================================

-- Agregar columna 'category' a la tabla volunteer_events
ALTER TABLE volunteer_events
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('general', 'recoleccion', 'distribucion', 'capacitacion', 'limpieza', 'otro')) DEFAULT 'general';

-- Agregar columna 'required_materials' a la tabla volunteer_events
ALTER TABLE volunteer_events
ADD COLUMN IF NOT EXISTS required_materials TEXT;

-- Agregar columna 'meeting_point' a la tabla volunteer_events
ALTER TABLE volunteer_events
ADD COLUMN IF NOT EXISTS meeting_point TEXT;

-- Crear índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_volunteer_events_category ON volunteer_events(category);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
