-- Migration: 00001_create_user_habits.sql
-- Descripción: Crea la tabla principal para almacenar los hábitos construidos por los usuarios.

CREATE TABLE IF NOT EXISTS user_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL,
    habit_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuración de Row Level Security (RLS)
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios hábitos
CREATE POLICY "Users can view their own habits" 
ON user_habits FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios hábitos
CREATE POLICY "Users can insert their own habits" 
ON user_habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios hábitos
CREATE POLICY "Users can update their own habits" 
ON user_habits FOR UPDATE 
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios hábitos
CREATE POLICY "Users can delete their own habits" 
ON user_habits FOR DELETE 
USING (auth.uid() = user_id);
