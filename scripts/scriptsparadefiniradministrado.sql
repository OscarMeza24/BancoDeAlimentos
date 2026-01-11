update auth.users
set
  raw_app_meta_data  = coalesce(raw_app_meta_data,  '{}'::jsonb) || jsonb_build_object('role','administrador'),
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','administrador')
where email = 'CORREO_ADMINISTRADOR_AQUI'; # Reemplazar por el correo del administrador