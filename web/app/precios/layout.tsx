import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios | Vetic - Planes para tu Veterinaria',
  description:
    'Planes transparentes desde Gs 0. Semilla, Crecimiento y Establecida. Sin costos ocultos, sin contratos. Calculadora de ROI incluida.',
  keywords: [
    'precios veterinaria',
    'software veterinario precio',
    'gestión veterinaria costo',
    'planes veterinaria',
    'Paraguay',
  ],
  openGraph: {
    title: 'Precios | Vetic - Planes para tu Veterinaria',
    description:
      'Planes desde Gs 0. Empezá gratis y subí de plan cuando lo necesites. Calculá tu ROI antes de decidir.',
    type: 'website',
    locale: 'es_PY',
  },
}

export default function PreciosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
