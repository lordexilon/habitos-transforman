-- Migration: 00006_create_push_subscriptions.sql
-- Descripción: Crea la tabla para almacenar las suscripciones de notificaciones Push de los usuarios.

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso anónimo (Desarrollo Local y MVP)
CREATE POLICY "Allow anonymous inserts push" 
ON push_subscriptions FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select push" 
ON push_subscriptions FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow anonymous delete push" 
ON push_subscriptions FOR DELETE 
TO public 
USING (true);
