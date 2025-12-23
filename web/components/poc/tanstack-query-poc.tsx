'use client'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
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
        <Icons.Loader className="animate-spin mr-2" />
        <span>Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h3 className="font-bold">Error al cargar los datos</h3>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">TanStack Query Proof-of-Concept</h2>
      <p className="mb-2">Datos de disponibilidad cargados con éxito:</p>
      <pre className="bg-gray-100 p-2 rounded">
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