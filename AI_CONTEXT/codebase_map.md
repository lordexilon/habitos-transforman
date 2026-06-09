# Mapeo del Código Base (Codebase Map)

## Puntos de Entrada
- `src/app/layout.tsx`: Layout principal (RootLayout), inyección de PWA y BottomNav.
- `src/app/page.tsx`: Página de inicio, menú de módulos.
- `src/components/layout/BottomNav.tsx`: Navegación inferior persistente.

## Módulos de Metodología SCA
- `/ciencia-del-habito`: `src/app/ciencia-del-habito/page.tsx`
- `/sistemas-vs-metas`: `src/app/sistemas-vs-metas/page.tsx`
- `/erradicacion-y-reemplazo`: `src/app/erradicacion-y-reemplazo/page.tsx`
- `/ecosistema-vida-sana`: `src/app/ecosistema-vida-sana/page.tsx`

## Componentes Compartidos
- `src/components/modules/TheoryCard.tsx`: Renderizado de tarjetas de texto tipo e-reader.
- `src/components/modules/HabitBuilder.tsx`: Constructor de recordatorios/señales interactivas.
- `src/components/modules/HabitRoutineInput.tsx`: Campo de entrada de la rutina.
- `src/components/modules/HabitRewardInput.tsx`: Constructor de recompensas y frases positivas.

## Utilidades y Configuración
- Cliente Supabase: `src/lib/supabase/client.ts`
- PWA Manifest: `public/manifest.json`
- Next config: `next.config.mjs`
- Directorio de Contenido Dinámico: `content/`
