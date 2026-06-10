# Contexto Activo - Hábitos Transforman (SCA v3.0)

**Estado Actual**: Daily Coach View implementado. Sistema de notificaciones Push corregido. Deploy en Vercel en progreso.
**Última Acción**: 
- **Agenda rediseñada** como "Daily Coach View": strip semanal de 7 días con dots de actividad, navegación entre semanas, timeline de tareas con hora/categoría/XP/recurrencia, modal Quick Add, persistencia Supabase (auth) + localStorage (guest). Píldora diaria y Reto Semanal preservados en vista de Hoy.
- **Fix Push Notifications (3 bugs)**: (1) Registro del SW ahora ocurre en `AuthProvider` al montar, exponiendo `swRegistration` por contexto para evitar timeouts en `serviceWorker.ready`. (2) Validación de keys VAPID con alerta visual en `perfil/page.tsx` cuando no están configuradas en Vercel. (3) Nuevo endpoint `/api/push/schedule` + `vercel.json` con cron "0 12 * * *" (9AM ART) para notificaciones diarias automáticas.
- **DB**: Migración `00008_upgrade_agenda.sql` creada (requiere ejecución manual en Supabase SQL Editor — no ejecutada via CLI por falta de `supabase link`).

**Siguientes Pasos Recomendados**:
- Ejecutar migración `00008_upgrade_agenda.sql` en el SQL Editor de Supabase.
- Agregar variables de entorno en Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.
- Fase 2 de Agenda: integración Google Calendar (puente de datos ya compatible con GCal API v3).
