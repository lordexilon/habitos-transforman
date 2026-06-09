import { NextResponse } from 'next/server';

export const maxDuration = 120; // 120s de timeout para Qwen

export async function POST(req: Request) {
  try {
    const { challengeTitle, completionRate, completedCount, totalCount } = await req.json();

    const rate = Number(completionRate || 0);
    const completed = Number(completedCount || 0);
    const total = Number(totalCount || 0);

    const systemPrompt = `Eres un Coach de Hábitos de IA de alto nivel.
Tu tarea es evaluar el progreso semanal de un usuario basándote en la tasa de finalización de su agenda y su reto de la semana actual.
Debes motivar al usuario y sugerir una ruta específica para la siguiente semana de forma amigable y en ESPAÑOL.

REGLAS DE FORMATO:
1. Responde ÚNICAMENTE con un objeto JSON válido.
2. NO incluyas markdown, bloques de código, explicaciones ni texto adicional fuera del JSON.
3. El JSON debe tener exactamente estas tres claves:
   - "score": número entero del 0 al 100 evaluando su constancia.
   - "feedback": texto de 3-4 líneas analizando empáticamente su rendimiento y dándole consejos valiosos y prácticos.
   - "nextChallengeSuggestion": sugerencia de reto para la próxima semana (ej: "Tu siguiente ruta recomendada es enfocarte en desconexión digital (Desafío: Noches sin Pantallas) para recargar energías.").

Formato de JSON esperado:
{
  "score": 85,
  "feedback": "Texto de feedback en español...",
  "nextChallengeSuggestion": "Sugerencia del siguiente reto semanal..."
}`;

    const userPrompt = `Evalúa mi rendimiento semanal:
- Reto Semanal: "${challengeTitle}"
- Tasa de finalización de agenda: ${rate}% (${completed} de ${total} tareas completadas)

Genera la evaluación y la ruta de la siguiente semana en ESPAÑOL adaptada a este progreso.`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 95000);

      const apiRes = await fetch('https://llm-qpkgcaf3gif9hgpv.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false,
          temperature: 0.4
        })
      });
      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        throw new Error(`Qwen API Error status ${apiRes.status}`);
      }

      const data = await apiRes.json();
      let textResponse = data.choices?.[0]?.message?.content || "{}";

      // Limpieza de tags de Qwen o markdown
      textResponse = textResponse
        .replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/g, '')
        .replace(/<\|im_start\|>/g, '')
        .replace(/<\|im_end\|>/g, '')
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/<\/think>/g, '')
        .replace(/<think>/g, '')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("JSON not found in LLM response");

      const parsed = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        evaluation: {
          score: parsed.score ?? Math.min(100, Math.max(10, rate + 10)),
          feedback: parsed.feedback || "Has hecho un gran esfuerzo de adaptación esta semana. Integrar nuevos hábitos en tu rutina física y mental requiere paciencia.",
          nextChallengeSuggestion: parsed.nextChallengeSuggestion || "Tu siguiente ruta recomendada es enfocarte en el hábito de la hidratación (Desafío de Súper Hidratación)."
        }
      });

    } catch (e: any) {
      console.warn("⚠️ Fallo en Qwen API para evaluación semanal. Usando fallback. Error:", e.message);
      // Fallback local robusto
      const calculatedScore = Math.min(100, Math.max(15, rate + 12));
      return NextResponse.json({
        evaluation: {
          score: calculatedScore,
          feedback: `Completaste el ${rate}% de tu agenda. Tu Coach de IA valora enormemente el esfuerzo de esta semana. Ajustar tus hábitos diariamente es un gran paso. Sigue con esta constancia para ver los resultados del interés compuesto en tu vida.`,
          nextChallengeSuggestion: "Tu siguiente ruta recomendada es enfocarte en desconexión digital (Desafío: Noches sin Pantallas) para potenciar tu descanso."
        }
      });
    }

  } catch (error: any) {
    console.error("Weekly Evaluate API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
