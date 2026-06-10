-- Migration: 00008_upgrade_agenda.sql
-- Descripción: Extiende user_agenda con campos para Daily Coach View:
--   hora exacta, fecha, puntos XP, color de categoría y recurrencia semanal.

-- Agregar columna de fecha del evento (para filtrar por día)
ALTER TABLE user_agenda
  ADD COLUMN IF NOT EXISTS event_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS start_time TIME,          -- Hora de inicio (ej. 09:00)
  ADD COLUMN IF NOT EXISTS end_time TIME,            -- Hora fin opcional
  ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'indigo', -- indigo | violet | emerald | orange | rose
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,       -- puntos al completar
  ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) DEFAULT 'none', -- none | daily | weekly
  ADD COLUMN IF NOT EXISTS linked_habit_id UUID REFERENCES user_habits(id) ON DELETE SET NULL;

-- Índice para consultas por usuario + fecha (común en la vista diaria)
CREATE INDEX IF NOT EXISTS idx_user_agenda_user_date
  ON user_agenda(user_id, event_date);
