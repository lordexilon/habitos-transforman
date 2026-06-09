import Link from "next/link";
import { Brain, Target, ShieldBan, HeartPulse, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="p-6 pb-20">
      <header className="mb-10 mt-6 flex flex-col items-center text-center">
        <Logo className="w-20 h-20 mb-4" showText={true} textClassName="text-4xl" />
        <p className="text-gray-500 mt-3 text-base">La metodología definitiva para dominar tu mente y transformar tu vida.</p>
        <Link href="/auth" className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
          Comenzar Ahora <ArrowRight className="w-5 h-5" />
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Tus Módulos</h2>
        
        <Link href="/ciencia-del-habito" className="block">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-md text-white flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="bg-white/20 p-3 rounded-full">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">La Ciencia del Hábito</h3>
              <p className="text-blue-100 text-xs">Entiende el ciclo neurológico.</p>
            </div>
          </div>
        </Link>

        <Link href="/sistemas-vs-metas" className="block">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-md text-white flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="bg-white/20 p-3 rounded-full">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Sistemas vs. Metas</h3>
              <p className="text-emerald-100 text-xs">El progreso continuo.</p>
            </div>
          </div>
        </Link>

        <Link href="/erradicacion-y-reemplazo" className="block">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-4 shadow-md text-white flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="bg-white/20 p-3 rounded-full">
              <ShieldBan className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Erradicación</h3>
              <p className="text-rose-100 text-xs">Sustituye lo destructivo.</p>
            </div>
          </div>
        </Link>

        <Link href="/ecosistema-vida-sana" className="block">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-4 shadow-md text-white flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="bg-white/20 p-3 rounded-full">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">El Ecosistema</h3>
              <p className="text-teal-100 text-xs">Tu entorno ideal.</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
