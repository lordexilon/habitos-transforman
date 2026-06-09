import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { coachText } = await req.json();

    if (!coachText) {
      return NextResponse.json({ error: 'Texto del coach requerido' }, { status: 400 });
    }

    const systemPrompt = `Eres un asistente inteligente especializado en extraer tareas.
El usuario te dará un texto escrito por un coach de vida con una serie de hábitos o rutinas recomendadas.
Tu objetivo es extraer esas rutinas y convertirlas en un JSON estricto.

Reglas:
1. Extrae cada hábito o acción específica.
2. Identifica la "categoría" (personal, dieta, lectura, laboral, ejercicio, etc.).
3. Identifica el "momento" sugerido (Mañana, Tarde, Noche, Fines de semana, Todo el día).
4. El texto de la tarea debe ser claro, directo y accionable.
5. Devuelve ÚNICAMENTE un arreglo JSON, sin markdown, sin backticks y sin texto adicional.

Formato esperado:
[
  { "task": "Beber 2 vasos de agua al despertar", "time": "Mañana", "category": "dieta" },
  { "task": "Caminar 30 min al aire libre", "time": "Mañana", "category": "ejercicio" }
]`;

    const model = 'qwen-plus';

    const apiRes = await fetch('https://llm-qpkgcaf3gif9hgpv.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: coachText }
        ],
        stream: false,
        temperature: 0.1
      })
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(`Qwen API Error: ${apiRes.statusText} - ${errorText}`);
    }

    const data = await apiRes.json();
    let textResponse = data.choices?.[0]?.message?.content || "[]";
    
    // Limpiar posibles backticks de markdown
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedAgenda = JSON.parse(textResponse);

    return NextResponse.json({ agenda: parsedAgenda });

  } catch (error: any) {
    console.error("Agenda Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
