-- Script para agregar índices de optimización a la tabla notifications
-- Ejecuta este script en Supabase SQL Editor si aún no lo has hecho

-- Índice para búsquedas rápidas por usuario_id (para el navbar y página de notificaciones)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id) 
INCLUDE (created_at, read);

-- Índice para obtener notificaciones no leídas de un usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
ON notifications(user_id, read) 
INCLUDE (created_at);

-- Índice para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

-- Índice para búsquedas por tipo de notificación
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(type) 
INCLUDE (created_at);
