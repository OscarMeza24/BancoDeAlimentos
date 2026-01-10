-- Agregar columnas de latitud y longitud para ubicación de recogida en food_items
ALTER TABLE food_items
ADD COLUMN IF NOT EXISTS pickup_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pickup_longitude DOUBLE PRECISION;

-- Crear índice para búsquedas geoespaciales
CREATE INDEX IF NOT EXISTS idx_food_items_location ON food_items(pickup_latitude, pickup_longitude);
