import {
  Shield, Zap, Server, Lock, Globe, Clock,
  CheckCircle, Award, Sparkles, Database
} from 'lucide-react';

const securityBadges = [
  {
    icon: Lock,
    title: 'SSL Encriptado',
    description: 'Conexion segura HTTPS'
  },
  {
    icon: Shield,
    title: 'RLS Security',
    description: 'Datos aislados por clinica'
  },
  {
    icon: Database,
    title: 'Backups Diarios',
    description: 'Respaldo automatico'
  },
  {
    icon: Server,
    title: 'Cloud Hosting',
    description: 'Servidores de alta disponibilidad'
  }
];

const techStack = [
  { name: 'Next.js', description: 'Framework React' },
  { name: 'Supabase', description: 'Base de datos' },
  { name: 'Vercel', description: 'Hosting global' },
  { name: 'TypeScript', description: 'Codigo tipado' }
];

const performanceMetrics = [
  {
    icon: Zap,
    value: '<1s',
    label: 'Tiempo de carga',
    color: '#2DCEA3'
  },
  {
    icon: Globe,
    value: '99.9%',
    label: 'Uptime garantizado',
    color: '#00C9FF'
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Monitoreo activo',
    color: '#5C6BFF'
  },
  {
    icon: CheckCircle,
    value: '100%',
    label: 'Mobile responsive',
    color: '#2DCEA3'
  }
];

export function TrustBadges() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#0F172A] to-[#131B2E] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Award className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-white/70 text-sm">Tecnologia de Confianza</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Seguridad y rendimiento de nivel empresarial
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Tu clinica merece la mejor tecnologia. Usamos las mismas herramientas
            que empresas como Netflix, Twitch y GitHub.
          </p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {performanceMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${metric.color}20` }}
              >
                <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {metric.value}
              </div>
              <div className="text-white/50 text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="mb-12">
          <h3 className="text-center text-white/40 uppercase tracking-widest text-sm mb-6">
            Seguridad
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {securityBadges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10"
              >
                <badge.icon className="w-5 h-5 text-[#2DCEA3]" />
                <div>
                  <div className="text-white text-sm font-medium">{badge.title}</div>
                  <div className="text-white/40 text-xs">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h3 className="text-center text-white/40 uppercase tracking-widest text-sm mb-6">
            Stack Tecnologico
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="group relative px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#2DCEA3]/30 transition-all cursor-default"
              >
                <span className="text-white font-medium text-sm">{tech.name}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#0F172A] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <span className="text-white/70 text-xs">{tech.description}</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#2DCEA3]/5 via-transparent to-[#5C6BFF]/5 border border-white/10">
            <Sparkles className="w-8 h-8 text-[#2DCEA3] mx-auto mb-4" />
            <p className="text-white/70 text-lg leading-relaxed">
              "Construimos VetePy con la misma calidad y estandares que usarian
              las mejores empresas de tecnologia del mundo. Porque las mascotas
              paraguayas merecen lo mejor."
            </p>
            <p className="text-white/40 text-sm mt-4">
              — Equipo VetePy
            </p>
          </div>
        </div>

        {/* Compliance notes */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            Cumplimos con estandares internacionales de seguridad de datos.
            Tus datos nunca se comparten con terceros.
          </p>
        </div>
      </div>
    </section>
  );
}
