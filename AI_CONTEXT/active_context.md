# Contexto Activo - Hábitos Transforman (SCA v3.0)

**Estado Actual**: Optimización de Módulos, Carga de Invitados, Caché Semanal y Despliegue en Vercel totalmente completados y estables.
**Última Acción**: 
- Implementación de pre-generación paralela de los 4 módulos de hábitos al ingresar por primera vez o al cambiar de nivel, almacenados en `user_custom_modules`.
- Configuración de importación estática de JSONs para evadir lecturas de archivos con `fs` en producción (resolución de error de compilación/ NFT bundler en Vercel).
- Trigger automático silencioso para regeneración de la semana al evaluar retrospectivas y reclamar XP en el `WeeklyEvaluationModal`.
- Vinculación correcta del `user_id` al insertar en `user_habits` para que el Coach de IA pueda ver el historial del usuario.

**Siguientes Pasos Recomendados**:
- Implementar notificaciones Push basadas en Service Worker (VAPID) en producción una vez configuradas las variables de entorno correspondientes.
- Refinar las respuestas del Coach de IA basándose en los hábitos recién guardados y consolidados.
