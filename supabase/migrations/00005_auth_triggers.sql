-- Migration: 00005_auth_triggers.sql
-- Descripción: Crea el trigger para inicializar perfiles automáticamente y añade columnas de límite diario.

-- 1. Añadir columnas para el límite diario al perfil
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS coach_interactions_today INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_interaction_date DATE DEFAULT CURRENT_DATE;

-- 2. Crear función para manejar nuevos registros
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, points, current_streak)
  VALUES (new.id, 0, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el Trigger (Borramos primero si existe para evitar errores)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- NOTA: Las políticas RLS de auth.users son manejadas internamente por Supabase.
