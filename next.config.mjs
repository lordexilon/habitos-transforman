import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false, // Deshabilitamos auto-registro para evitar el error 404 en Vercel. Lo hacemos manual en AuthProvider.
  skipWaiting: true,
  workboxOptions: {
    importScripts: ["/sw-push.js"]
  }
});


/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
