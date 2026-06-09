import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const maxDuration = 120;

// Cargar todo el conocimiento teórico del libro para el In-Context RAG
function loadKnowledgeBase() {
  const contentDir = path.join(process.cwd(), 'content');
  const files = ['01-como-funcionan.json', '02-sistemas.json', '03-erradicacion.json', '04-ecosistema.json'];
  
  let kb = '';
  files.forEach(f => {
    try {
      const data = fs.readFileSync(path.join(contentDir, f), 'utf-8');
      const json = JSON.parse(data);
      kb += `--- MÓDULO: ${json.title} ---\n`;
      json.sections?.forEach((s: any) => {
        if (s.type === 'theory') {
          kb += `Concepto: ${s.title}\nTeoría: ${s.content}\n\n`;
        }
      });
    } catch (e) {
      console.error("Error reading " + f, e);
    }
  });
  return kb;
}

export async function POST(req: Request) {
  try {
    const { messages, userHabits } = await req.json();

    const kb = loadKnowledgeBase();

    const systemPrompt = `Eres un Coach de Hábitos amigable, práctico y conversacional. Conoces la teoría de "Hábitos Poderosos", pero NO suenas como un libro de texto. Tu tono es motivador, directo, empático y en ESPAÑOL.

BASE DE CONOCIMIENTO (Teoría del libro):
${kb}

ESTADO ACTUAL DEL USUARIO (Sus hábitos definidos en la app):
${userHabits ? JSON.stringify(userHabits, null, 2) : "Aún no ha definido hábitos."}

REGLAS:
1. Actúa como un humano, un coach amigo. NO enumeres pasos como un manual a menos que te lo pidan explícitamente.
2. Si el usuario reporta un fracaso o problema, sé súper empático. Dale UNA sugerencia práctica (basada en la teoría) usando un lenguaje del día a día.
3. Formatea tu texto de forma amigable: usa negritas para resaltar palabras clave, viñetas si es necesario y añade algunos emojis 🚀✨ para hacerlo más visual y menos pesado.
4. NO uses palabras como "la teoría dice" o "apliquemos la teoría". Simplemente da el consejo de manera natural.
5. REGLA DE ORO: Responde SIEMPRE y ÚNICAMENTE en Español. NO uses inglés bajo ninguna circunstancia.
6. CRÍTICO: NO generes monólogos internos, borradores o pensamientos. NO uses formato "User Input:" o "Internal Monologue". Escribe directamente tu mensaje final para el usuario.`;

    const model = process.env.LOCAL_OLLAMA_MODEL || 'qwen3.5:latest';

    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        options: {
          temperature: 0.5 // Creativo pero apegado al contexto
        }
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama Error: ${ollamaResponse.statusText}`);
    }

    // Retornamos el stream directamente al cliente
    return new Response(ollamaResponse.body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
      }
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
