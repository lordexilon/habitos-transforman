-- Migration: 00007_create_custom_modules.sql
-- Descripción: Crea la tabla para almacenar la caché de módulos dinámicos personalizados por usuario.

CREATE TABLE IF NOT EXISTS user_custom_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL,
    points_at_generation INTEGER DEFAULT 0 NOT NULL,
    module_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, module_id)
);

-- Habilitar RLS
ALTER TABLE user_custom_modules ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso anónimo (Desarrollo Local y MVP)
CREATE POLICY "Allow anonymous inserts custom modules" 
ON user_custom_modules FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select custom modules" 
ON user_custom_modules FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow anonymous update custom modules" 
ON user_custom_modules FOR UPDATE 
TO public 
USING (true);
