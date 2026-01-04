'use client'
import { useState, useEffect } from 'react'
import {
  Plus,
  Tag,
  Calendar,
  Trash2,
  Loader2,
  Search,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CampaignsClient() {
  const { clinic } = useParams() as { clinic: string }
  const supabase = createClient()

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]) // {id, discount_type, discount_value}
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [clinic])

  const fetchData = async () => {
    setLoading(true)
    const { data: camps } = await supabase
      .from('store_campaigns')
      .select('*, store_campaign_items(*, store_products(name))')
      .eq('tenant_id', clinic)
      .order('created_at', { ascending: false })

    const { data: prods } = await supabase
      .from('store_products')
      .select('id, sku, name, base_price')
      .eq('tenant_id', clinic)
      .eq('is_active', true)

    setCampaigns(camps || [])
    setProducts(prods || [])
    setLoading(false)
  }

  const handleAddProduct = (p: any) => {
    if (selectedProducts.find((sp) => sp.id === p.id)) return
    setSelectedProducts([
      ...selectedProducts,
      { ...p, discount_type: 'percentage', discount_value: 10 },
    ])
  }

  const handleSave = async () => {
    if (!name || !startDate || !endDate || selectedProducts.length === 0) return
    setIsSaving(true)

    try {
      const { data: camp, error: cError } = await supabase
        .from('store_campaigns')
        .insert({
          tenant_id: clinic,
          name,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
        })
        .select()
        .single()

      if (cError) throw cError

      const items = selectedProducts.map((sp) => ({
        campaign_id: camp.id,
        product_id: sp.id,
        discount_type: sp.discount_type,
        discount_value: sp.discount_value,
      }))

      const { error: iError } = await supabase.from('store_campaign_items').insert(items)

      if (iError) throw iError

      setShowNewForm(false)
      setName('')
      setStartDate('')
      setEndDate('')
      setSelectedProducts([])
      fetchData()
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error(e)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta campaña?')) return
    await supabase.from('store_campaigns').delete().eq('id', id)
    fetchData()
  }

  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div>
          <h1 className="mb-2 text-3xl font-black text-gray-900">Promociones</h1>
          <p className="text-gray-500">Crea eventos de descuento por tiempo limitado.</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="hover:bg-[var(--primary)]/90 inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg transition"
        >
          <Plus className="h-5 w-5" /> Nueva Campaña
        </button>
      </div>

      {showNewForm && (
        <div className="border-[var(--primary)]/20 animate-in zoom-in-95 rounded-3xl border bg-white p-8 shadow-xl duration-200">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <Tag className="h-5 w-5 text-[var(--primary)]" /> Configurar Nueva Campaña
          </h2>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Nombre del Evento
              </label>
              <input
                type="text"
                placeholder="Ej: Black Friday, Navidad..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Inicio
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Selector de Productos */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos para agregar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border-none bg-gray-50 py-3 pl-10 pr-4"
                />
              </div>

              <div className="scrollbar-hide max-h-60 space-y-2 overflow-y-auto pr-2">
                {products
                  .filter(
                    (p) => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 p-3 transition hover:bg-gray-100"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                      </div>
                      <button
                        onClick={() => handleAddProduct(p)}
                        className="rounded-lg border border-gray-100 bg-white p-2 text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Productos Seleccionados */}
            <div className="space-y-4 rounded-2xl bg-gray-50 p-6">
              <p className="px-2 text-xs font-black uppercase tracking-widest text-gray-400">
                Productos Seleccionados ({selectedProducts.length})
              </p>
              <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                {selectedProducts.map((sp, idx) => (
                  <div
                    key={sp.id}
                    className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <button
                      onClick={() =>
                        setSelectedProducts(selectedProducts.filter((p) => p.id !== sp.id))
                      }
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <p className="mb-3 text-sm font-bold">{sp.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const updated = [...selectedProducts]
                          updated[idx].discount_type = 'percentage'
                          setSelectedProducts(updated)
                        }}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-black uppercase transition-all ${sp.discount_type === 'percentage' ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <Percent className="h-3 w-3" /> Porcentaje
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...selectedProducts]
                          updated[idx].discount_type = 'fixed_amount'
                          setSelectedProducts(updated)
                        }}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-black uppercase transition-all ${sp.discount_type === 'fixed_amount' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <DollarSign className="h-3 w-3" /> Monto Fijo
                      </button>
                    </div>
                    <input
                      type="number"
                      value={sp.discount_value}
                      onChange={(e) => {
                        const updated = [...selectedProducts]
                        updated[idx].discount_value = parseFloat(e.target.value) || 0
                        setSelectedProducts(updated)
                      }}
                      className="mt-3 w-full rounded-lg border-none bg-gray-50 px-3 py-2 text-center text-sm font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-6 py-3 font-bold text-gray-500 transition hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || selectedProducts.length === 0}
              className="hover:bg-[var(--primary)]/90 rounded-2xl bg-[var(--primary)] px-8 py-3 font-bold text-white shadow-lg transition disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Crear Campaña'}
            </button>
          </div>
        </div>
      )}

      {/* Listado de Campañas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((camp) => {
          const isActive =
            new Date(camp.start_date) <= new Date() && new Date(camp.end_date) >= new Date()
          return (
            <div
              key={camp.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`absolute right-0 top-0 rounded-bl-2xl px-4 py-1 text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                {isActive ? 'Activa' : 'Programada'}
              </div>

              <h3 className="mb-4 text-xl font-bold text-gray-900">{camp.name}</h3>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    {new Date(camp.start_date).toLocaleDateString()} -{' '}
                    {new Date(camp.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span>{camp.store_campaign_items?.length || 0} productos en descuento</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <button
                  onClick={() => handleDelete(camp.id)}
                  className="p-2 text-red-100 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}
                >
                  {isActive ? 'Dando beneficios' : 'Pendiente'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
