-- Migration: 00004_create_agenda.sql
-- Descripción: Crea tabla para guardar la agenda/to-do diaria gamificada del usuario.

CREATE TABLE IF NOT EXISTS user_agenda (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_text TEXT NOT NULL,
    time_of_day VARCHAR(50), -- Ej. 'Mañana', 'Tarde', 'Noche', 'Fines de semana'
    category VARCHAR(50),    -- Ej. 'personal', 'dieta', 'lectura', 'laboral'
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE user_agenda ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso anónimo (Desarrollo Local y MVP)
CREATE POLICY "Allow anonymous inserts agenda" 
ON user_agenda FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select agenda" 
ON user_agenda FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow anonymous update agenda" 
ON user_agenda FOR UPDATE 
TO public 
USING (true);

CREATE POLICY "Allow anonymous delete agenda" 
ON user_agenda FOR DELETE 
TO public 
USING (true);
