import Link from "next/link";
import { Brain, Target, ShieldBan, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 pb-20">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Hábitos <span className="text-blue-600">Poderosos</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm">Metodología SCA para transformar tu vida.</p>
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
