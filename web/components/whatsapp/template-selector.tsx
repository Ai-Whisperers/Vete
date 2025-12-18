'use client'

import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { templateCategoryConfig, type WhatsAppTemplate } from '@/lib/types/whatsapp'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: WhatsAppTemplate, variables: Record<string, string>) => void
  templates: WhatsAppTemplate[]
  clientName?: string
  petName?: string
}

export function TemplateSelector({
  isOpen,
  onClose,
  onSelect,
  templates,
  clientName,
  petName,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Pre-fill common variables
  useEffect(() => {
    if (selectedTemplate) {
      const prefilledVars: Record<string, string> = {}
      selectedTemplate.variables.forEach((varName) => {
        if (varName === 'cliente' && clientName) {
          prefilledVars[varName] = clientName
        } else if (varName === 'mascota' && petName) {
          prefilledVars[varName] = petName
        } else {
          prefilledVars[varName] = ''
        }
      })
      setVariables(prefilledVars)
    }
  }, [selectedTemplate, clientName, petName])

  if (!isOpen) return null

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getPreviewContent = (template: WhatsAppTemplate): string => {
    let content = template.content
    template.variables.forEach((varName) => {
      const value = variables[varName] || `{{${varName}}}`
      content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value)
    })
    return content
  }

  const handleConfirm = () => {
    if (!selectedTemplate) return

    // Check all variables are filled
    const missingVars = selectedTemplate.variables.filter((v) => !variables[v]?.trim())
    if (missingVars.length > 0) {
      alert(`Completa las variables: ${missingVars.join(', ')}`)
      return
    }

    onSelect(selectedTemplate, variables)
    setSelectedTemplate(null)
    setVariables({})
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {selectedTemplate ? 'Configurar Plantilla' : 'Seleccionar Plantilla'}
          </h2>
          <button
            onClick={selectedTemplate ? () => setSelectedTemplate(null) : onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg"
          >
            {selectedTemplate ? (
              <Icons.ArrowLeft className="w-5 h-5" />
            ) : (
              <Icons.X className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile: Show either list OR preview */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* Filters - only show when viewing list */}
          {!selectedTemplate && (
            <div className="p-3 sm:p-4 border-b border-gray-100 space-y-3 sm:hidden">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar plantilla..."
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-base"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 min-h-[40px] rounded-full text-sm whitespace-nowrap ${
                    categoryFilter === 'all'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {Object.entries(templateCategoryConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`px-4 py-2 min-h-[40px] rounded-full text-sm whitespace-nowrap ${
                      categoryFilter === key
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop filters */}
          <div className="hidden sm:block p-4 border-b border-gray-100 space-y-3 w-full">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  categoryFilter === 'all'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {Object.entries(templateCategoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    categoryFilter === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
            {/* Template list - hidden on mobile when template selected */}
            <div className={`w-full sm:w-1/2 sm:border-r border-gray-100 overflow-y-auto ${
              selectedTemplate ? 'hidden sm:block' : ''
            }`}>
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                  No se encontraron plantillas
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredTemplates.map((template) => {
                    const categoryConfig = templateCategoryConfig[template.category]
                    const isSelected = selectedTemplate?.id === template.id

                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full p-4 min-h-[60px] text-left hover:bg-gray-50 ${
                          isSelected ? 'bg-[var(--primary)]/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`${categoryConfig.color} mt-0.5`}>
                            {categoryConfig.icon === 'Calendar' && <Icons.Calendar className="w-5 h-5" />}
                            {categoryConfig.icon === 'Syringe' && <Icons.Syringe className="w-5 h-5" />}
                            {categoryConfig.icon === 'MessageCircle' && <Icons.MessageCircle className="w-5 h-5" />}
                            {categoryConfig.icon === 'Megaphone' && <Icons.Megaphone className="w-5 h-5" />}
                            {categoryConfig.icon === 'RefreshCw' && <Icons.RefreshCw className="w-5 h-5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate">
                              {template.name}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                              {template.content}
                            </p>
                          </div>
                          <Icons.ChevronRight className="w-5 h-5 text-gray-300 sm:hidden" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Preview and variables - shown on mobile when template selected */}
            <div className={`w-full sm:w-1/2 overflow-y-auto p-4 ${
              !selectedTemplate ? 'hidden sm:block' : ''
            }`}>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-[var(--text-primary)] text-lg">
                    {selectedTemplate.name}
                  </h3>

                  {/* Variables */}
                  {selectedTemplate.variables.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        Variables
                      </p>
                      {selectedTemplate.variables.map((varName) => (
                        <div key={varName}>
                          <label className="text-sm text-[var(--text-secondary)] capitalize block mb-1">
                            {varName}
                          </label>
                          <input
                            type="text"
                            value={variables[varName] || ''}
                            onChange={(e) => setVariables({ ...variables, [varName]: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg
                                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-base"
                            placeholder={`Ingrese ${varName}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview */}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Vista previa
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {getPreviewContent(selectedTemplate)}
                      </p>
                    </div>
                  </div>

                  {/* Confirm button */}
                  <button
                    onClick={handleConfirm}
                    className="w-full py-4 min-h-[48px] bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90"
                  >
                    Usar plantilla
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                  <p>Selecciona una plantilla</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
