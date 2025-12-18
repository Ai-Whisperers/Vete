"use client";

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PrescriptionPDF } from './prescription-pdf';
import * as Icons from 'lucide-react';

// TICKET-TYPE-003: Define proper types for prescription data
interface PrescriptionData {
    petName: string;
    species?: string;
    breed?: string;
    ownerName: string;
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    vetName: string;
    vetLicense?: string;
    date: string;
    drugs: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    notes?: string;
}

interface PrescriptionDownloadButtonProps {
    data: PrescriptionData;
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
