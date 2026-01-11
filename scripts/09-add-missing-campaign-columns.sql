-- =====================================================
-- SCRIPT DE MIGRACIÓN: Agregar columnas faltantes a campaigns
-- =====================================================
-- ORDEN DE EJECUCIÓN: 9 - EJECUTAR DESPUÉS de los scripts 01-08
-- =====================================================

-- Agregar columna 'category' a la tabla campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('alimentos', 'emergencia', 'educacion', 'salud', 'otro')) DEFAULT 'alimentos';

-- Agregar columna 'target_organization' a la tabla campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS target_organization TEXT;

-- Agregar columna 'location' a la tabla campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS location TEXT;

-- Agregar columna 'latitude' a la tabla campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Agregar columna 'longitude' a la tabla campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Crear índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);

-- Crear índice para búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_campaigns_location ON campaigns(latitude, longitude) WHERE latitude IS NOT NULL;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
