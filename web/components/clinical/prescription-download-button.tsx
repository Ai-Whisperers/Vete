"use client";

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PrescriptionPDF } from './prescription-pdf';
import * as Icons from 'lucide-react';

interface PrescriptionDownloadButtonProps {
    data: any;
    fileName: string;
}

export default function PrescriptionDownloadButton({ data, fileName }: PrescriptionDownloadButtonProps) {
    return (
        <PDFDownloadLink document={<PrescriptionPDF {...data} />} fileName={fileName}>
            {({ blob, url, loading, error }) => (
                <button 
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl shadow-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all font-bold"
                >
                    {loading ? (
                        <>
                         <Icons.Loader2 className="w-5 h-5 animate-spin" /> Generando PDF...
                        </>
                    ) : (
                        <>
                         <Icons.Download className="w-5 h-5" /> Descargar Receta
                        </>
                    )}
                </button>
            )}
        </PDFDownloadLink>
    );
}
