'use client';

import { Printer, Download } from 'lucide-react';

interface InvoiceActionsProps {
  invoiceNumber: string;
}

export function InvoiceActions({ invoiceNumber }: InvoiceActionsProps): React.ReactElement {
  const handlePrint = (): void => {
    window.print();
  };

  const handleDownload = (): void => {
    // TODO: Implement PDF generation
    alert('La descarga de PDF estará disponible próximamente.');
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Printer className="w-4 h-4" />
        Imprimir
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Descargar PDF
      </button>
    </>
  );
}
