import { createClient } from "@/lib/supabase/server";
import * as Icons from "lucide-react";
import Link from "next/link";

export default async function GlobalStatsPage() {
  const supabase =  await createClient();

  // Call the global stats RPC
  const { data: stats, error } = await supabase.rpc('get_network_stats');

  if (error) {
      return <div>Error loading stats: {error.message}</div>
  }

  // Mocking some extra data for "Research" vibes if RPC returns minimal info
  const displayStats = {
      total_pets: stats?.total_pets || 0,
      total_vaccines: stats?.total_vaccines || 0,
      popular_species: stats?.most_popular_species || 'Unknown'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center transform rotate-3">
                        <Icons.Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">VeteNetwork <span className="text-cyan-400">Analytics</span></h1>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Global Data HUB</p>
                    </div>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    Volver al Inicio
                </Link>
            </div>
        </header>

        <main className="container mx-auto px-6 py-12">
            <div className="mb-12 text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Análisis en Tiempo Real
                </h2>
                <p className="text-slate-400 text-lg">
                    Datos agregados de toda la red veterinaria para investigación y control epidemiológico.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icons.PawPrint className="w-24 h-24 text-cyan-400" />
                    </div>
                    <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">Población Total</p>
                    <p className="text-5xl font-black text-white">{displayStats.total_pets}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <span className="text-green-400 font-bold flex items-center gap-1">
                            <Icons.ArrowUp className="w-4 h-4" /> +12%
                        </span>
                        vs mes pasado
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icons.Syringe className="w-24 h-24 text-purple-400" />
                    </div>
                    <p className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">Vacunación Efectiva</p>
                    <p className="text-5xl font-black text-white">{displayStats.total_vaccines}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <span className="text-green-400 font-bold flex items-center gap-1">
                            <Icons.CheckCircle2 className="w-4 h-4" /> Alta
                        </span>
                        Cobertura
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icons.Dna className="w-24 h-24 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Especie Dominante</p>
                    <p className="text-4xl font-black text-white capitalize">{displayStats.popular_species || 'N/A'}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                            Tendencia Global
                        </span>
                    </div>
                </div>
            </div>

            {/* Detailed Cards (Mocking functionality for "Students") */}
            <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-slate-800/30 border border-white/5 p-8 rounded-3xl">
                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                         <Icons.PieChart className="w-5 h-5 text-cyan-400" /> Distribución de Dietas
                     </h3>
                     {/* Placeholder for Chart */}
                     <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-white/10 pb-4">
                         <div className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors rounded-t-lg relative group h-[80%]">
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">80%</span>
                         </div>
                         <div className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors rounded-t-lg relative group h-[40%]">
                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">40%</span>
                         </div>
                         <div className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors rounded-t-lg relative group h-[60%]">
                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">60%</span>
                         </div>
                     </div>
                     <div className="flex justify-between mt-4 text-xs text-slate-400 uppercase font-bold tracking-wider">
                         <span>Balanceado</span>
                         <span>BARF</span>
                         <span>Mixto</span>
                     </div>
                 </div>

                 <div className="bg-slate-800/30 border border-white/5 p-8 rounded-3xl">
                     <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xl font-bold flex items-center gap-2">
                            <Icons.Download className="w-5 h-5 text-emerald-400" /> Exportar Datos
                        </h3>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded uppercase">CSV / JSON</span>
                     </div>
                     <p className="text-slate-400 mb-6">
                         Descarga datasets anonimizados para análisis académico, tesis o estudios de mercado.
                     </p>
                     
                     <div className="space-y-3">
                         <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm flex items-center justify-between px-6 transition-colors group">
                             <span>Reporte Epidemiológico 2024</span>
                             <Icons.Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                         </button>
                         <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm flex items-center justify-between px-6 transition-colors group">
                             <span>Tendencias de Nutrición</span>
                             <Icons.Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                         </button>
                     </div>
                 </div>
            </div>

        </main>
    </div>
  );
}
