'use client'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'

const queryClient = new QueryClient()

const fetchAvailability = async () => {
  const res = await fetch('/api/availability')
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  return res.json()
}

function TanStackQueryComponent() {
  const { data, error, isPending } = useQuery({
    queryKey: ['availability'],
    queryFn: fetchAvailability,
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <Icons.Loader className="mr-2 animate-spin" />
        <span>Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
        <h3 className="font-bold">Error al cargar los datos</h3>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-4 text-xl font-bold">TanStack Query Proof-of-Concept</h2>
      <p className="mb-2">Datos de disponibilidad cargados con éxito:</p>
      <pre className="rounded bg-gray-100 p-2">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  )
}

export default function TanstackQueryPoc() {
  return (
    <QueryClientProvider client={queryClient}>
      <TanStackQueryComponent />
    </QueryClientProvider>
  )
}
