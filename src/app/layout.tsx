import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import AuthProvider from "@/components/providers/AuthProvider";
import SplashScreen from "@/components/layout/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hábitos Poderosos",
  description: "App para consumo dinámico de contenido del libro Hábitos Poderosos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hábitos",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 pb-16`}>
        <SplashScreen />
        <AuthProvider>
          <TopBar />
          <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl pt-16">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
