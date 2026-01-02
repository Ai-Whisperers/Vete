'use client';

import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  Star,
  Coins,
  FileText,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  created_at: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  method: string;
  invoice_id?: string;
}

interface LoyaltyInfo {
  balance: number;
  lifetime_earned: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  recent_transactions?: Array<{
    id: string;
    points: number;
    description: string;
    type: 'earn' | 'redeem';
    created_at: string;
  }>;
}

interface PetFinancesTabProps {
  petId: string;
  petName: string;
  invoices: Invoice[];
  payments: Payment[];
  loyalty?: LoyaltyInfo | null;
  clinic: string;
}

export function PetFinancesTab({
  petId,
  petName,
  invoices,
  payments,
  loyalty,
  clinic,
}: PetFinancesTabProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = invoices.filter(i => ['sent', 'overdue'].includes(i.status));
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      case 'sent':
        return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'overdue':
        return { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
      default:
        return { label: 'Borrador', color: 'bg-gray-100 text-gray-500', icon: FileText };
    }
  };

  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'Platino', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-700' };
      case 'gold':
        return { label: 'Oro', color: 'from-yellow-400 to-amber-500', textColor: 'text-amber-700' };
      case 'silver':
        return { label: 'Plata', color: 'from-gray-300 to-gray-400', textColor: 'text-gray-600' };
      default:
        return { label: 'Bronce', color: 'from-orange-300 to-orange-400', textColor: 'text-orange-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Paid */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-medium">Total Pagado</span>
          </div>
          <p className="text-2xl font-black text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.length} pagos registrados</p>
        </div>

        {/* Pending */}
        <div className={`rounded-xl border p-4 ${totalPending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Pendiente</span>
          </div>
          <p className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
            {formatCurrency(totalPending)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{pendingInvoices.length} factura{pendingInvoices.length !== 1 ? 's' : ''} pendiente{pendingInvoices.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-xs font-medium">Puntos de Lealtad</span>
          </div>
          <p className="text-2xl font-black">{loyalty?.balance?.toLocaleString() || 0}</p>
          {loyalty?.tier && (
            <p className="text-xs text-white/70 mt-1">
              Nivel {getTierConfig(loyalty.tier).label}
            </p>
          )}
        </div>
      </div>

      {/* Pending Invoices Alert */}
      {pendingInvoices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
            <AlertCircle className="w-5 h-5" />
            Facturas Pendientes de Pago
          </div>
          <div className="space-y-2">
            {pendingInvoices.slice(0, 3).map(invoice => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
              >
                <div>
                  <p className="font-medium text-sm">{invoice.invoice_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(invoice.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">{formatCurrency(invoice.total)}</p>
                  {invoice.due_date && new Date(invoice.due_date) < new Date() && (
                    <p className="text-xs text-red-600">Vencida</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href={`/${clinic}/portal/invoices?status=pending`}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Pagar Ahora
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Loyalty Card */}
      {loyalty && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Programa de Lealtad
          </h3>

          {/* Progress to next tier */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Progreso al siguiente nivel</span>
              <span className="font-medium text-purple-600">
                {loyalty.lifetime_earned?.toLocaleString() || 0} pts acumulados
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all"
                style={{ width: `${Math.min((loyalty.lifetime_earned || 0) / 10000 * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Recent transactions */}
          {loyalty.recent_transactions && loyalty.recent_transactions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Últimos Movimientos</h4>
              <div className="space-y-2">
                {loyalty.recent_transactions.slice(0, 5).map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'earn' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {tx.type === 'earn' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <Gift className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-purple-600'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/${clinic}/portal/loyalty`}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600 font-medium hover:underline"
          >
            Ver todos los beneficios
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            Historial de Facturas
          </h3>
          <Link
            href={`/${clinic}/portal/invoices`}
            className="text-sm text-[var(--primary)] font-medium hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.slice(0, 5).map(invoice => {
              const statusConfig = getStatusConfig(invoice.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                      <Receipt className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{invoice.invoice_number}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-[var(--text-primary)]">
                      {formatCurrency(invoice.total)}
                    </p>
                    <Link
                      href={`/${clinic}/portal/invoices/${invoice.id}`}
                      className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sin facturas registradas</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            Historial de Pagos
          </h3>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.slice(0, 5).map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pago recibido</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(payment.payment_date)}
                      <span className="mx-1">•</span>
                      {payment.method}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sin pagos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
