import { NextResponse } from 'next/server';

export const maxDuration = 60;

/**
 * Endpoint optimizado para respuestas de voz del Coach.
 * A diferencia de /api/chat (que hace streaming), este devuelve
 * texto corto y directo, ideal para síntesis de voz (TTS).
 */
export async function POST(req: Request) {
  try {
    const { message, userHabits, history } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ reply: 'No escuché nada. ¿Podés intentarlo de nuevo?' });
    }

    // Construir contexto de hábitos del usuario
    const habitsContext = userHabits && userHabits.length > 0
      ? `\n\nHábitos actuales del usuario:\n${userHabits.map((h: any) =>
          `- Señal: ${h.cue || 'N/A'}, Rutina: ${h.routine || 'N/A'}, Recompensa: ${h.reward || 'N/A'}`
        ).join('\n')}`
      : '';

    // Historial reciente (últimas 4 interacciones para contexto)
    const recentHistory = (history || [])
      .slice(-4)
      .map((m: any) => ({ role: m.role, content: m.content }));

    const systemPrompt = `Eres el Coach de hábitos de SCAHábitos. El usuario te habla por voz.
REGLAS CRÍTICAS para respuestas de voz:
1. Máximo 2 oraciones. Sé directo y cálido.
2. Sin listas, sin asteriscos, sin markdown. Solo texto natural para hablar.
3. Usa un tono motivacional pero conversacional, como un coach real.
4. Si el usuario dice que completó algo, celebralo brevemente y pregunta qué sigue.
5. Si hace una pregunta, responde de forma concisa y práctica.${habitsContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const apiRes = await fetch(
      'https://llm-qpkgcaf3gif9hgpv.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen-plus',
          messages,
          stream: false,
          temperature: 0.7,
          max_tokens: 120, // Respuestas cortas para voz
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`Qwen API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();
    let reply = data.choices?.[0]?.message?.content || 'No pude procesar tu mensaje.';

    // Limpiar tokens especiales de Qwen
    reply = reply
      .replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/g, '')
      .replace(/<\|im_start\|>/g, '')
      .replace(/<\|im_end\|>/g, '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .trim();

    return NextResponse.json({ reply, transcript: message });

  } catch (error: any) {
    console.error('Voice Coach Error:', error);
    return NextResponse.json({
      reply: 'Tuve un problema de conexión. ¿Podemos intentarlo de nuevo?',
    });
  }
}
