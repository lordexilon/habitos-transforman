-- Migration: 00002_allow_anon.sql
-- Descripción: Permite insertar y leer hábitos anónimamente para pruebas locales.

CREATE POLICY "Allow anonymous inserts" 
ON user_habits FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select" 
ON user_habits FOR SELECT 
TO public 
USING (true);
