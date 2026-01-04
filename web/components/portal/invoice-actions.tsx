'use client'

import { useState } from 'react'
import { Printer, Download, Loader2 } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface PortalInvoice {
  id: string
  invoice_number: string
  status: string
  subtotal: number
  tax_amount: number
  tax_rate?: number
  discount_amount: number
  total: number
  notes: string | null
  due_date: string | null
  created_at: string
  paid_at: string | null
  invoice_items: InvoiceItem[]
  owner?: {
    full_name: string
    email: string
    phone?: string
  }
  pet?: {
    name: string
    species: string
  }
}

interface InvoiceActionsProps {
  invoice: PortalInvoice
  clinicName: string
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  invoiceInfo: {
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    color: '#666',
    width: 80,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    color: '#666',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
  },
})

function formatCurrency(amount: number): string {
  return `Gs. ${amount.toLocaleString('es-PY')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// PDF Document Component for Portal
function PortalInvoicePDF({
  invoice,
  clinicName,
}: {
  invoice: PortalInvoice
  clinicName: string
}): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{clinicName}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>Factura</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text>Fecha: {formatDate(invoice.created_at)}</Text>
            {invoice.due_date && <Text>Vencimiento: {formatDate(invoice.due_date)}</Text>}
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{invoice.owner?.full_name || 'N/A'}</Text>
          </View>
          {invoice.owner?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{invoice.owner.email}</Text>
            </View>
          )}
          {invoice.owner?.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{invoice.owner.phone}</Text>
            </View>
          )}
          {invoice.pet && (
            <View style={styles.row}>
              <Text style={styles.label}>Mascota:</Text>
              <Text style={styles.value}>
                {invoice.pet.name} ({invoice.pet.species})
              </Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Descripción</Text>
              <Text style={styles.col2}>Cant.</Text>
              <Text style={styles.col3}>Precio</Text>
              <Text style={styles.col4}>Subtotal</Text>
            </View>
            {invoice.invoice_items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.description}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.col4}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: 'green' }}>Descuento</Text>
              <Text style={{ color: 'green' }}>-{formatCurrency(invoice.discount_amount)}</Text>
            </View>
          )}
          {invoice.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({invoice.tax_rate || 10}%)</Text>
              <Text>{formatCurrency(invoice.tax_amount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalValue}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={{ color: '#666' }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Gracias por confiar en {clinicName}</Text>
      </Page>
    </Document>
  )
}

export function InvoiceActions({ invoice, clinicName }: InvoiceActionsProps): React.ReactElement {
  const [loading, setLoading] = useState(false)

  const handlePrint = (): void => {
    window.print()
  }

  const handleDownload = async (): Promise<void> => {
    setLoading(true)
    try {
      const blob = await pdf(
        <PortalInvoicePDF invoice={invoice} clinicName={clinicName} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al generar PDF. Por favor intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </button>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Descargar PDF
      </button>
    </>
  )
}
