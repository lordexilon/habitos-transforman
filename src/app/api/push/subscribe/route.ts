import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Suscripción Push inválida" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Verificar si esta suscripción (endpoint) ya existe en la base de datos
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('subscription->>endpoint', subscription.endpoint)
      .maybeSingle();

    if (existing) {
      // Si existe, actualizamos el userId por si inició sesión ahora
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ user_id: userId })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Si no existe, la insertamos
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          subscription: subscription
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Push Subscribe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Retornar la llave pública VAPID actual para que el frontend pueda encriptar la suscripción
export async function GET() {
  try {
    const { vapidKeys } = require('@/lib/webPush');
    return NextResponse.json({ publicKey: vapidKeys.publicKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
