import { Metadata } from 'next'
import { ArasyHome } from '@/components/arasy/ArasyHome'

export const metadata: Metadata = {
  title: 'Barrio Cerrado Arasy - Viviendas en Areguá, Paraguay',
  description: 'Barrio privado en Areguá con seguridad 24hs, piscina, quinchos y amenities familiares. Tu hogar soñado en Central.',
  keywords: ['barrio cerrado', 'Areguá', 'vivienda Paraguay', 'casa 2 dormitorios', 'casa 3 dormitorios', 'pool', 'seguridad'],
}

export default function ArasyPage() {
  return <ArasyHome />
}