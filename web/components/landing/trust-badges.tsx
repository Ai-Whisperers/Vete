import {
  Shield,
  Zap,
  Server,
  Lock,
  Globe,
  Clock,
  CheckCircle,
  Award,
  Sparkles,
  Database,
} from 'lucide-react'

const securityBadges = [
  {
    icon: Lock,
    title: 'SSL Encriptado',
    description: 'Conexion segura HTTPS',
  },
  {
    icon: Shield,
    title: 'RLS Security',
    description: 'Datos aislados por clinica',
  },
  {
    icon: Database,
    title: 'Backups Diarios',
    description: 'Respaldo automatico',
  },
  {
    icon: Server,
    title: 'Cloud Hosting',
    description: 'Servidores de alta disponibilidad',
  },
]

const techStack = [
  { name: 'Next.js', description: 'Framework React' },
  { name: 'Supabase', description: 'Base de datos' },
  { name: 'Vercel', description: 'Hosting global' },
  { name: 'TypeScript', description: 'Codigo tipado' },
]

const performanceMetrics = [
  {
    icon: Zap,
    value: '<1s',
    label: 'Tiempo de carga',
    color: '#2DCEA3',
  },
  {
    icon: Globe,
    value: '99.9%',
    label: 'Uptime garantizado',
    color: '#00C9FF',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Monitoreo activo',
    color: '#5C6BFF',
  },
  {
    icon: CheckCircle,
    value: '100%',
    label: 'Mobile responsive',
    color: '#2DCEA3',
  },
]

export function TrustBadges() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#131B2E] py-16 md:py-20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Award className="h-4 w-4 text-[#2DCEA3]" />
            <span className="text-sm text-white/70">Tecnologia de Confianza</span>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            Seguridad y rendimiento de nivel empresarial
          </h2>
          <p className="mx-auto max-w-2xl text-white/50">
            Tu clinica merece la mejor tecnologia. Usamos las mismas herramientas que empresas como
            Netflix, Twitch y GitHub.
          </p>
        </div>

        {/* Performance Metrics */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {performanceMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:border-white/20"
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${metric.color}20` }}
              >
                <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
              </div>
              <div className="mb-1 text-2xl font-black text-white md:text-3xl">{metric.value}</div>
              <div className="text-sm text-white/50">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="mb-12">
          <h3 className="mb-6 text-center text-sm uppercase tracking-widest text-white/40">
            Seguridad
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {securityBadges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3"
              >
                <badge.icon className="h-5 w-5 text-[#2DCEA3]" />
                <div>
                  <div className="text-sm font-medium text-white">{badge.title}</div>
                  <div className="text-xs text-white/40">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h3 className="mb-6 text-center text-sm uppercase tracking-widest text-white/40">
            Stack Tecnologico
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="group relative cursor-default rounded-lg border border-white/10 bg-white/5 px-4 py-2 transition-all hover:border-[#2DCEA3]/30"
              >
                <span className="text-sm font-medium text-white">{tech.name}</span>
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0F172A] px-3 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs text-white/70">{tech.description}</span>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#2DCEA3]/5 via-transparent to-[#5C6BFF]/5 p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#2DCEA3]" />
            <p className="text-lg leading-relaxed text-white/70">
              "Construimos VetePy con la misma calidad y estandares que usarian las mejores empresas
              de tecnologia del mundo. Porque las mascotas paraguayas merecen lo mejor."
            </p>
            <p className="mt-4 text-sm text-white/40">— Equipo VetePy</p>
          </div>
        </div>

        {/* Compliance notes */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/30">
            Cumplimos con estandares internacionales de seguridad de datos. Tus datos nunca se
            comparten con terceros.
          </p>
        </div>
      </div>
    </section>
  )
}
