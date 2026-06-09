import webpush from 'web-push';

// Claves efímeras en memoria en caso de no estar configuradas en .env.local
let vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

// Auto-generación de llaves si faltan en desarrollo local
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.warn("⚠️ Las variables de entorno VAPID para notificaciones Push no están definidas en .env.local.");
  console.warn("Generating ephemeral VAPID keys for local runtime...");
  try {
    const generated = webpush.generateVAPIDKeys();
    vapidKeys.publicKey = generated.publicKey;
    vapidKeys.privateKey = generated.privateKey;
    console.log("-----------------------------------------");
    console.log("📋 Copia esto en tu archivo .env.local para persistir tus suscripciones Push:");
    console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${generated.publicKey}"`);
    console.log(`VAPID_PRIVATE_KEY="${generated.privateKey}"`);
    console.log("-----------------------------------------");
  } catch (e) {
    console.error("Error generating VAPID keys:", e);
  }
}

try {
  webpush.setVapidDetails(
    'mailto:coach@scahabitos.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (e) {
  console.error("Error configuring web-push details:", e);
}

export { webpush, vapidKeys };
