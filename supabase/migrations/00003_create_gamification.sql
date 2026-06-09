-- Migration: 00003_create_gamification.sql
-- Descripción: Crea tabla de perfiles para guardar puntos y rachas de gamificación.

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    last_active DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso anónimo (Desarrollo Local)
CREATE POLICY "Allow anonymous inserts profiles" 
ON user_profiles FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select profiles" 
ON user_profiles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow anonymous update profiles" 
ON user_profiles FOR UPDATE 
TO public 
USING (true);
