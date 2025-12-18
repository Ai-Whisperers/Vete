"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText,
  ChevronRight
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  pet_name?: string;
  items_count: number;
}

export default function PaymentsPage(): React.ReactElement {
  const params = useParams();
  const clinic = params?.clinic as string;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`/api/invoices/owner?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setInvoices(data);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [clinic]);

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "overdue":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "Pagado";
      case "pending":
        return "Pendiente";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
    }
  };

  const getStatusBg = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "overdue":
        return "bg-red-50 text-red-700";
      case "cancelled":
        return "bg-gray-50 text-gray-500";
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    if (filter === "paid") return inv.status === "paid";
    if (filter === "pending") return ["pending", "overdue"].includes(inv.status);
    return true;
  });

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalPending = invoices
    .filter((i) => ["pending", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + i.total_amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${clinic}/portal/dashboard`}
            className="p-2 rounded-xl hover:bg-white transition-colors"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              Mis Pagos
            </h1>
            <p className="text-sm text-gray-500">
              Historial de facturas y pagos
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Pagado</span>
            </div>
            <p className="text-2xl font-black text-green-600">
              {totalPaid.toLocaleString("es-PY")} Gs
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Pendiente</span>
            </div>
            <p className="text-2xl font-black text-yellow-600">
              {totalPending.toLocaleString("es-PY")} Gs
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "Todas" },
            { value: "paid", label: "Pagadas" },
            { value: "pending", label: "Pendientes" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                No hay facturas para mostrar
              </p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/${clinic}/portal/invoices/${invoice.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">
                        {invoice.invoice_number}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(invoice.created_at).toLocaleDateString("es-PY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {invoice.pet_name && (
                          <span>• {invoice.pet_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-[var(--text-primary)]">
                        {invoice.total_amount.toLocaleString("es-PY")} Gs
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(
                          invoice.status
                        )}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Payment Methods Info */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de Pago Aceptados
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Efectivo
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tarjeta de débito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Transferencia bancaria
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
