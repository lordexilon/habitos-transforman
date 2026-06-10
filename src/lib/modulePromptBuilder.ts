/**
 * Utilidad para construir prompts dinámicos orientados a Qwen
 * inyectando los conceptos del libro para cada módulo y estructurando el formato JSON esperado.
 */

export interface ModuleSection {
  id: string;
  type: 'theory' | 'interactive_node';
  title: string;
  image?: string;
  content?: string;
  component?: string;
  description?: string;
  props?: any;
}

export interface GeneratedModule {
  module: number;
  title: string;
  sections: ModuleSection[];
}

const MODULE_CONCEPTS: Record<number, { title: string; coreConcepts: string; schemaInstructions: string }> = {
  1: {
    title: "¿Cómo Funcionan Los Hábitos?",
    coreConcepts: `
- El bucle del hábito: Señal (Recordatorio), Rutina y Recompensa. Basado en el capítulo "La anatomía del Hábito".
- Señal: El disparador conductual (debe ser obvio). Escribir listas de hábitos diarios para anclar la nueva señal.
- Rutina: El accionar en sí (debe ser extremadamente simple de hacer en menos de 2 minutos).
- Recompensa: El beneficio biológico o emocional (debe ser placentero y celebrarse con diálogo positivo inmediato).
    `,
    schemaInstructions: `
El JSON debe tener un arreglo "sections" con exactamente los siguientes componentes y tipos en orden:
1. Una sección de tipo "theory" (id: "theory-1") sobre el bucle del hábito (Señal, Rutina, Recompensa).
2. Una sección de tipo "theory" (id: "theory-2") que muestre un ejemplo de la vida real de este bucle.
3. Una sección "interactive_node" (id: "action-1") con component: "HabitBuilder". En props debe incluir "suggested_triggers_list_1" y "suggested_triggers_list_2".
4. Una sección "theory" (id: "theory-3") sobre hacer la rutina ridículamente simple.
5. Una sección "interactive_node" (id: "action-2") con component: "HabitRoutineInput". Sin props especiales.
6. Una sección "theory" (id: "theory-4") sobre la recompensa y celebración.
7. Una sección "interactive_node" (id: "action-3") con component: "HabitRewardInput". En props debe incluir "suggested_rewards".
`
  },
  2: {
    title: "Sistemas vs. Metas",
    coreConcepts: `
- Los ganadores y perdedores tienen las mismas metas. Lo que diferencia es el sistema (el proceso diario). Basado en el capítulo "El Problema con las Fechas Límite".
- Diseñar un horario en lugar de fijar una fecha límite ("Quiero correr todos los días después del trabajo" en lugar de "Quiero correr un maratón").
- Los Hábitos Clave (Keystone Habits): Rutinas que desencadenan mejoras automáticas en otras áreas de tu vida (ej. hacer ejercicio ayuda a comer mejor y dormir mejor).
    `,
    schemaInstructions: `
El JSON debe tener un arreglo "sections" con exactamente los siguientes componentes y tipos en orden:
1. Una sección "theory" (id: "theory-1") sobre por qué los sistemas superan a las metas y el error de las fechas límite.
2. Una sección "interactive_node" (id: "action-1") con component: "ScheduleBuilder". En props debe incluir "suggested_frequencies" (array de strings).
3. Una sección "theory" (id: "theory-2") sobre los hábitos clave (Keystone Habits).
4. Una sección "interactive_node" (id: "action-2") con component: "KeystoneHabitSelector". En props debe incluir "suggested_keystones" (array de strings).
5. Una sección "theory" (id: "theory-3") sobre la acción exitosa triple (Mental, Elaboración y Física).
`
  },
  3: {
    title: "Erradicación y Reemplazo",
    coreConcepts: `
- Los malos hábitos responden a necesidades de lidiar con el estrés o el aburrimiento. Basado en el capítulo "Reemplazo Neuronal".
- No puedes eliminar un hábito, solo reemplazarlo manteniendo la misma señal y la misma recompensa.
- El poder del "Pero" para revertir el diálogo mental negativo tras un fallo.
- Planificar para el fracaso: prever qué hacer cuando falles para recuperar la racha inmediatamente.
    `,
    schemaInstructions: `
El JSON debe tener un arreglo "sections" con exactamente los siguientes componentes y tipos en orden:
1. Una sección "theory" (id: "theory-1") sobre cómo el estrés y el aburrimiento originan malos hábitos.
2. Una sección "interactive_node" (id: "action-1") con component: "BadHabitAnalyzer". En props debe incluir "causes" (array de strings).
3. Una sección "theory" (id: "theory-2") sobre la regla de oro del cambio de hábitos: no elimines, reemplaza.
4. Una sección "interactive_node" (id: "action-2") con component: "SubstituteHabitSelector". En props debe incluir "suggested_substitutes" (array de strings).
5. Una sección "theory" (id: "theory-3") sobre el poder del "Pero" en el diálogo negativo y la resiliencia ante tropiezos.
6. Una sección "interactive_node" (id: "action-3") con component: "NegativeDialogueReframer". Sin props especiales.
`
  },
  4: {
    title: "El Ecosistema de Vida Sana",
    coreConcepts: `
- Los pilares de una vida saludable: sueño reparador (7-9 horas), hidratación, actividad física diaria y alimentación lenta. Basado en el capítulo "La Base de una Vida Saludable".
- Hábitos en familia y el diseño del entorno para facilitar buenos hábitos y dificultar los malos.
- Retos colectivos y compromisos públicos para mejorar el ecosistema de salud mental y física.
    `,
    schemaInstructions: `
El JSON debe tener un arreglo "sections" con exactamente los siguientes componentes y tipos en orden:
1. Una sección "theory" (id: "theory-1") sobre los pilares físicos y biológicos de la salud (sueño, agua, deporte, nutrición).
2. Una sección "interactive_node" (id: "action-1") con component: "EcosystemAudit". En props debe incluir "ecosystem_areas" (array de strings).
3. Una sección "theory" (id: "theory-2") sobre la influencia del entorno y la familia en el desarrollo de buenos hábitos.
4. Una sección "interactive_node" (id: "action-2") con component: "FamilyChallengePlanner". En props debe incluir "suggested_challenges" (array de strings).
`
  }
};

export function buildModulePrompt(moduleId: number, points: number): { systemPrompt: string; userPrompt: string } {
  const moduleConfig = MODULE_CONCEPTS[moduleId];
  if (!moduleConfig) {
    throw new Error(`Módulo ${moduleId} no soportado`);
  }

  let levelLabel = "Principiante (Nivel 1)";
  let toneInstruction = "Usa un tono simple, amigable, directo y con ejemplos cotidianos muy fáciles de asimilar.";
  
  if (points >= 200) {
    levelLabel = "Avanzado (Nivel 3)";
    toneInstruction = "Usa un tono profesional, profundo, con fundamentos neurocientíficos y psicológicos del libro. Introduce explicaciones detalladas y retos complejos.";
  } else if (points >= 100) {
    levelLabel = "Intermedio (Nivel 2)";
    toneInstruction = "Usa un tono reflexivo y práctico. Incorpora algunas sutilezas sobre el comportamiento, y conecta la teoría con el análisis personal.";
  }

  const systemPrompt = `Eres un generador inteligente de módulos educativos de hábitos.
Basándote en las directrices del libro de hábitos del usuario, debes generar el contenido completo del módulo solicitado.
Nivel del usuario: ${levelLabel}.
Directriz de tono: ${toneInstruction}

REGLAS DE FORMATO:
1. Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código de markdown, sin caracteres extraños ni explicaciones.
2. Cada lección o texto debe estar completamente limpio: NO incluyas referencias académicas tipo "[cite: X]".
3. Garantiza que toda la puntuación sea correcta, sin espacios antes de comas, puntos o dos puntos.
4. Para las imágenes de teoría, usa exactamente las siguientes rutas según el ID de sección o tema:
   - Para ciencia del hábito: "/images/mod1_theory1_3rs_1780950191612.png", "/images/mod1_theory2_phone_1780950201297.png", "/images/mod1_theory3_simple_1780950211100.png", "/images/mod1_theory4_reward_1780950220517.png"
   - Para sistemas: "/images/mod2_theory1_deadline_1780950229425.png", "/images/mod2_theory2_keystone_1780950240478.png", "/images/mod2_theory3_triple_1780950251110.png"
   - Para erradicación: "/images/mod3_theory1_stress_1780950261409.png", "/images/mod3_theory2_replace_1780950273238.png", "/images/mod3_theory3_but_1780950284324.png"
   - Para ecosistema: "/images/mod4_theory1_health_1780950294412.png", "/images/mod4_theory2_family_1780950304402.png"
5. CRÍTICO: Cuando listes conceptos secuenciales (como las 3 R: Recordatorio, Rutina, Recompensa), usa saltos de línea dobles (\\n\\n) y destaca los nombres de los conceptos en negrita simple con doble asterisco (ej: **1. Recordatorio**: ..., **2. Rutina**: ..., **3. Recompensa**: ...). Esto es indispensable para que el frontend los muestre como una lista vertical estructurada y ordenada en lugar de un bloque de texto plano.
6. ACUMULACIÓN DE CONTENIDO: Si el nivel del usuario es Nivel 2 o Nivel 3, debes generar el contenido en forma acumulativa. Esto significa que debes mantener las explicaciones y las secciones interactivas fundamentales de los niveles anteriores, pero agregando nuevas secciones de teoría y nuevos retos interactivos más profundos correspondientes a su nivel actual. Todo debe estar en el mismo JSON de modo que el usuario vea su contenido previo sumado al nuevo.

Formato del JSON esperado:
{
  "module": ${moduleId},
  "title": "${moduleConfig.title}",
  "sections": [
     // Arreglo de secciones (teóricas e interactivas)
  ]
}`;

  const userPrompt = `Genera el contenido del Módulo ${moduleId}: "${moduleConfig.title}".
Nivel del usuario: ${levelLabel}.

Conceptos teóricos a inyectar (del libro):
${moduleConfig.coreConcepts}

Esquema y orden del módulo:
${moduleConfig.schemaInstructions}

Asegúrate de que el contenido de los textos esté totalmente redactado en ESPAÑOL, sea original y se adapte perfectamente al nivel ${levelLabel}.`;

  return { systemPrompt, userPrompt };
}
