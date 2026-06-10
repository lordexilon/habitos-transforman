import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { webpush } from '@/lib/webPush';

/**
 * Vercel Cron Job — Notificación diaria de hábitos.
 * Se ejecuta todos los días a las 12:00 UTC (9:00 AM ART).
 * 
 * Requiere CRON_SECRET en Vercel para autorizar la llamada.
 * Configurado en vercel.json como: "0 12 * * *"
 */
export async function GET(req: Request) {
  // Validar que la petición viene del cron de Vercel (y no de un atacante)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Obtener todos los suscriptores con user_id (usuarios autenticados)
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .not('user_id', 'is', null);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay suscriptores activos.', sent: 0 });
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'America/Argentina/Buenos_Aires' });

    const messages = [
      `Buenos días 🌅 Tu Coach tiene tareas listas para hoy. ¡${now.getDate()} de ${now.toLocaleDateString('es-ES', { month: 'long' })} empieza con energía!`,
      `¡Hola, campeón! 🏆 El hábito de hoy define al profesional de mañana. ¡Veamos tu agenda!`,
      `🔔 Recordatorio de hábitos: ya es ${dayName}. ¡Un día más para mantener tu racha!`,
      `Tu Coach IA te espera 🤖 Revisa tu agenda del día y suma XP manteniendo tu racha.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const payload = JSON.stringify({
      title: '⚡ Hábitos del día',
      body: randomMessage,
      url: '/agenda',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
    });

    let sentCount = 0;
    let errorCount = 0;

    await Promise.allSettled(
      subscriptions.map(async (subRecord) => {
        try {
          await webpush.sendNotification(subRecord.subscription, payload);
          sentCount++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Suscripción expirada: limpiar de la BD
            await supabase.from('push_subscriptions').delete().eq('id', subRecord.id);
            console.log(`🧹 Suscripción inactiva eliminada: ${subRecord.id}`);
          } else {
            errorCount++;
            console.error(`❌ Error enviando push a ${subRecord.id}:`, err.message);
          }
        }
      })
    );

    console.log(`📨 Cron push enviado: ${sentCount} exitosos, ${errorCount} errores`);
    return NextResponse.json({ success: true, sent: sentCount, errors: errorCount });

  } catch (error: any) {
    console.error('❌ Cron push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
