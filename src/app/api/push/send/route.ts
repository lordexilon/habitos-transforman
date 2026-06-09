import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { webpush } from '@/lib/webPush';

export async function POST(req: Request) {
  try {
    const { title, body, userId, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Título y cuerpo requeridos" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Obtener las suscripciones asociadas
    let query = supabase.from('push_subscriptions').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: subscriptions, error } = await query;
    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: "No hay dispositivos suscritos" });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/agenda',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png'
    });

    const sendPromises = subscriptions.map(async (subRecord) => {
      try {
        await webpush.sendNotification(subRecord.subscription, payload);
      } catch (err: any) {
        // Si la suscripción ha expirado o no es válida, la eliminamos de la BD
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`🧹 Eliminando suscripción inactiva/revocada: ${subRecord.id}`);
          await supabase.from('push_subscriptions').delete().eq('id', subRecord.id);
        } else {
          console.error(`Error enviando push a registro ${subRecord.id}:`, err);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });

  } catch (error: any) {
    console.error("Push Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
