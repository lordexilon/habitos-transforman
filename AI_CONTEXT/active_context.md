# Contexto Activo - Hábitos Transforman (SCA v3.0)

**Estado Actual**: Daily Coach View implementado. Notificaciones Push y Voice Chat con Qwen (Push-to-talk) desplegados en Vercel.
**Última Acción**: 
- **Voice Chat con el Coach**: Integración de Web Speech API (STT) + Qwen-Plus (respuestas optimizadas `max_tokens: 120`) + Web Speech Synthesis (TTS). Componente interactivo con animaciones de ondas de audio y layout corregido (`100dvh`).
- **Fix Push SW 404 en Vercel**: Se deshabilitó el auto-registro de `next-pwa` (`register: false`) ya que Vercel no sirve correctamente el `sw.js` generado dinámicamente en `/public`. En su lugar, `AuthProvider` ahora registra explícitamente el archivo estático `/sw-push.js`, garantizando la disponibilidad del Service Worker para notificaciones.
- **Fix Push Subscribe GET Endpoint**: Cambio de `require('@/lib/webPush')` a lectura directa de `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` para evitar errores del runtime serverless en Vercel.
- **Mejora UX Reto Semanal**: Reemplazo de la tarjeta estática por una interactiva que muestra el progreso de la semana, los días faltantes para la evaluación (Viernes 8PM) y permite realizar "Check-in" diario para ganar XP.

- **Agenda rediseñada** como "Daily Coach View": strip semanal, timeline de tareas, Quick Add, persistencia Supabase/local.
- **DB**: Migración `00008_upgrade_agenda.sql` ejecutada manual en Supabase.

**Siguientes Pasos Recomendados**:
- Ejecutar migración `00008_upgrade_agenda.sql` en el SQL Editor de Supabase.
- Agregar variables de entorno en Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.
- Fase 2 de Agenda: integración Google Calendar (puente de datos ya compatible con GCal API v3).
