'use client'

import useSWR from 'swr'
import * as Icons from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SwrPoc() {
  const { data, error, isLoading } = useSWR('/api/availability', fetcher)

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h3 className="font-bold">Error al cargar los datos</h3>
        <p>{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Icons.Loader className="animate-spin mr-2" />
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">SWR Proof-of-Concept</h2>
      <p className="mb-2">Datos de disponibilidad cargados con éxito:</p>
      <pre className="bg-gray-100 p-2 rounded">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  )
}