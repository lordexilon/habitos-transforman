import { NextResponse } from 'next/server';

// Extender timeout de Next.js a 120s para modelos locales lentos (Qwen, DeepSeek, etc.)
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Valores que indican campo vacío o sin datos reales
    const INVALID_VALUES = new Set([
      'falta definir', '', 'n/a', 'ninguno', 'sin definir', 'pendiente', 'null', 'undefined'
    ]);

    const meaningfulFields = Object.entries(body).filter(([_, v]) => {
      if (!v) return false;
      const str = String(v).trim().toLowerCase();
      return str.length > 2 && !INVALID_VALUES.has(str);
    });

    // Vacío si no hay campos con contenido real O si hay menos de 1 campo válido
    const isEmpty = meaningfulFields.length === 0;

    // Construir string solo con los campos que tienen contenido real
    const habitStr = meaningfulFields
      .map(([k, v]) => `- ${k}: "${v}"`)
      .join('\n');

    const prompt = isEmpty
      ? `Responde EXACTAMENTE con este JSON (nada más): {"score":5,"strengths":["Sin datos aún"],"improvement":"Completa los campos de tu hábito antes de evaluar.","proposal":"Escribe tu señal, rutina y recompensa para continuar."}`
      : `Eres un coach de hábitos experto. Analiza el siguiente plan del usuario y evalúalo en ESPAÑOL.

Hábito del usuario:
${habitStr}

IMPORTANTE: Genera un análisis ORIGINAL basado únicamente en los datos del usuario. NO copies ejemplos.

Responde ÚNICAMENTE con un objeto JSON válido con estas claves (sin texto antes ni después):
- "score": número entero del 0 al 100 según la viabilidad y especificidad del plan
- "strengths": array de 1-2 strings con los puntos fuertes reales del hábito del usuario
- "improvement": string con el consejo más crítico y específico para mejorar ESTE hábito concreto
- "proposal": string con una reformulación poderosa y específica de ESTE hábito, usando los datos del usuario`;

    // Configuración para Ollama local. 
    const model = process.env.LOCAL_OLLAMA_MODEL || 'qwen3.5:latest'; 

    try {
      // AbortController para un timeout manual de 90s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          think: false,   // Deshabilita el modo "thinking" de Qwen3.5 - responde directo
          options: {
            num_predict: 300,
            temperature: 0.3
          }
        })
      });
      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        throw new Error(`Error de Ollama: ${ollamaRes.statusText}`);
      }

      const data = await ollamaRes.json();
      // /api/chat devuelve data.message.content (no data.response como /api/generate)
      let textResponse = data.message?.content || data.response || "{}";
      
      // Log para debug - ver qué devuelve Qwen exactamente
      console.log("🤖 Respuesta cruda de Qwen:", textResponse.substring(0, 500));
      
      // 1. Eliminar tokens especiales del chat template de Qwen
      textResponse = textResponse
        .replace(/<\|im_start\|>.*?<\|im_end\|>/gs, '')  // bloques im_start/im_end
        .replace(/<\|im_start\|>/g, '')
        .replace(/<\|im_end\|>/g, '')
        .replace(/<think>[\s\S]*?<\/think>/g, '')          // bloques de pensamiento
        .replace(/<\/think>/g, '')
        .replace(/<think>/g, '')
        .trim();

      // 2. Extracción robusta: buscar TODOS los objetos JSON y tomar el último válido
      let parsed: any = null;
      const allMatches = [...textResponse.matchAll(/\{[\s\S]*?\}/g)];
      
      // Intentar parsear de mayor a menor (el JSON final suele ser el correcto)
      for (let i = allMatches.length - 1; i >= 0; i--) {
        try {
          const candidate = JSON.parse(allMatches[i][0]);
          // Verificar que tiene al menos la clave 'score' para confirmar que es el nuestro
          if (candidate && typeof candidate.score !== 'undefined') {
            parsed = candidate;
            break;
          }
        } catch {}
      }

      // Si los matches cortos fallaron, intentar con el bloque completo
      if (!parsed) {
        try {
          const fullMatch = textResponse.match(/\{[\s\S]*\}/);
          if (fullMatch) parsed = JSON.parse(fullMatch[0]);
        } catch (e) {
          console.error("❌ Fallo parseando JSON completo:", textResponse.substring(0, 300));
        }
      }

      if (!parsed) parsed = {};
      
      console.log("✅ JSON extraído:", parsed);
      
      // Aseguramos que siempre existan los campos esperados por la UI
      return NextResponse.json({
        score: parsed.score ?? 10,
        strengths: parsed.strengths || ["Esperando información válida"],
        improvement: parsed.improvement || "No pudimos analizar el hábito. Es probable que la información ingresada esté incompleta, vacía o contenga caracteres sin sentido. Por favor, detalla claramente tu Señal, Rutina y Recompensa.",
        proposal: parsed.proposal || "Escribe un hábito real y estructurado para recibir feedback de la IA."
      });

    } catch (fetchError: any) {
      if (fetchError.cause?.code === 'ECONNREFUSED' || fetchError.message.includes('fetch')) {
        return NextResponse.json({
          score: 50,
          strengths: ["ℹ️ Ollama no detectado"],
          improvement: `Para usar la IA local, asegúrate de tener la aplicación Ollama abierta en tu PC y haber descargado el modelo ejecutando: "ollama run ${model}" en tu terminal.`,
          proposal: "Abre Ollama y vuelve a intentarlo."
        });
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Coach API Error:", error);
    return NextResponse.json({ 
      score: 0,
      strengths: ["Error en el motor local de IA"],
      improvement: error.message,
      proposal: "Revisa la consola de tu servidor."
    }, { status: 500 });
  }
}
