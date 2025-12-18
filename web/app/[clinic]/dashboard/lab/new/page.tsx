'use client'

import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { LabOrderForm } from '@/components/lab/order-form'

export default function NewLabOrderPage() {
  const router = useRouter()
  const params = useParams()
  const clinic = params.clinic as string

  const handleSuccess = (orderId: string) => {
    router.push(`/${clinic}/dashboard/lab/${orderId}`)
  }

  const handleCancel = () => {
    router.push(`/${clinic}/dashboard/lab`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/${clinic}/dashboard/lab`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-primary)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Nueva Orden de Laboratorio
          </h1>
          <p className="text-[var(--text-secondary)]">
            Selecciona las pruebas y completa la información de la orden
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <LabOrderForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}
