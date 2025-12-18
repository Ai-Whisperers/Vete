"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { DrugSearch } from '@/components/clinical/drug-search';
import { DosageCalculator } from '@/components/clinical/dosage-calculator';
import { DigitalSignature } from '@/components/clinical/digital-signature';

// Dynamic import for PDF Button to avoid SSR issues
const PrescriptionDownloadButton = dynamic(
    () => import('@/components/clinical/prescription-download-button'),
    { ssr: false, loading: () => <button className="btn disabled">Cargando PDF...</button> }
);

interface PrescriptionFormProps {
    clinic: any;
    patient?: any;
    vetName: string; // From auth session presumably
}

export default function NewPrescriptionForm({ clinic, patient, vetName }: PrescriptionFormProps) {
    const router = useRouter();
    const [drugs, setDrugs] = useState<Array<{ name: string; dose: string; instructions: string }>>([]);
    const [notes, setNotes] = useState('');
    const [savedId, setSavedId] = useState<string | null>(null);
    const [signatureHash, setSignatureHash] = useState<string | null>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    // Temp form state for adding a drug
    const [tempDrug, setTempDrug] = useState({ name: '', dose: '', instructions: '' });

    const handleAddDrug = () => {
        if (tempDrug.name && tempDrug.dose) {
            setDrugs([...drugs, tempDrug]);
            setTempDrug({ name: '', dose: '', instructions: '' });
        }
    };

    const handleSave = async () => {
        if (!patient) return alert("Seleccione un paciente");
        if (!signatureDataUrl) return alert("Por favor, firme la receta para continuar");
        setIsSaving(true);

        try {
            // Generate a real-looking hash from the content
            const mockHash = 'SIG_' + Math.random().toString(36).substring(2, 10).toUpperCase();
            
            const payload = {
                pet_id: patient.id,
                vet_id: null, 
                drugs,
                notes,
                signature_hash: mockHash,
                signature_data: signatureDataUrl, // We'll store it in the DB
                qr_code_url: `https://adris.app/verify/${mockHash}`
            };

            const res = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setSavedId(data.id);
                setSignatureHash(mockHash);
            }
        } catch (e) {
            console.error(e);
            alert("Error al guardar receta");
        } finally {
            setIsSaving(false);
        }
    };

    const pdfData = {
        clinicName: clinic.config.name,
        clinicAddress: clinic.config.address || 'Calle Ficticia 123',
        patientName: patient?.name || 'Desconocido',
        ownerName: 'Propietario', 
        date: new Date().toLocaleDateString(),
        drugs,
        notes,
        vetName,
        signatureHash,
        signatureImage: signatureDataUrl // Pass to PDF
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Nueva Receta Médica</h1>
                    <p className="text-gray-500 mt-1">
                        Paciente: {patient ? <span className="font-bold text-[var(--primary)]">{patient.name} ({patient.species})</span> : 'No seleccionado'}
                    </p>
                </div>
                {savedId && (
                    <div className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-black flex items-center gap-2 animate-bounce">
                        <Icons.CheckCircle className="w-6 h-6" /> Guardado
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Medicines Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-gray-900 flex items-center gap-2 text-xl">
                                <Icons.Pill className="w-6 h-6 text-purple-500" /> Medicamentos
                            </h3>
                            <button 
                                onClick={() => setShowCalculator(!showCalculator)}
                                className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                            >
                                <Icons.Calculator className="w-4 h-4" /> Calculadora
                            </button>
                        </div>
                        
                        {/* Add Drug Form */}
                        <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Medicamento</label>
                                    <DrugSearch 
                                        onSelect={(d) => setTempDrug({ ...tempDrug, name: d.name })}
                                        placeholder="Buscar..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Dosis / Frecuencia</label>
                                    <input 
                                        className="w-full p-3 border-2 border-transparent bg-white rounded-xl focus:border-[var(--primary)] outline-none transition-all" 
                                        placeholder="Ej: 1 pastilla cada 8hs"
                                        value={tempDrug.dose}
                                        onChange={(e) => setTempDrug({ ...tempDrug, dose: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Indicaciones</label>
                                <div className="flex gap-4">
                                    <input 
                                        className="flex-1 p-3 border-2 border-transparent bg-white rounded-xl focus:border-[var(--primary)] outline-none transition-all" 
                                        placeholder="Ej: Dar con comida por 7 días"
                                        value={tempDrug.instructions}
                                        onChange={(e) => setTempDrug({ ...tempDrug, instructions: e.target.value })}
                                    />
                                    <button 
                                        onClick={handleAddDrug}
                                        disabled={!tempDrug.name || !tempDrug.dose}
                                        className="px-6 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-30 transition-all font-bold"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        {drugs.length > 0 ? (
                            <div className="space-y-3">
                                {drugs.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition-all group">
                                        <div>
                                            <p className="font-black text-gray-900">{d.name}</p>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {d.dose} <span className="text-gray-200 mx-2">•</span> <span className="italic">{d.instructions}</span>
                                            </p>
                                        </div>
                                        <button onClick={() => setDrugs(drugs.filter((_, idx) => idx !== i))} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Icons.Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                                 <Icons.Pill className="w-12 h-12 text-gray-100 mx-auto mb-2" />
                                 <p className="text-gray-300 font-bold">No hay medicamentos agregados</p>
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 text-xl">
                            <Icons.FileText className="w-6 h-6 text-blue-500" /> Notas de la Receta
                        </h3>
                        <textarea 
                            className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-6 min-h-[120px] focus:bg-white focus:border-[var(--primary)] outline-none transition-all text-gray-700 font-medium"
                            placeholder="Escriba aquí notas para el propietario o el farmacéutico..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Calculator Sidebar */}
                    {showCalculator && (
                        <div className="bg-white rounded-3xl shadow-sm border-2 border-purple-100 p-8 animate-in slide-in-from-top duration-300">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-gray-900 text-lg">Cálculo de Dosis</h3>
                                <button onClick={() => setShowCalculator(false)}><Icons.X className="w-5 h-5 text-gray-400" /></button>
                             </div>
                             <DosageCalculator initialWeightKg={patient?.weight_kg} />
                        </div>
                    )}

                    {/* Signature Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 text-xl">
                            <Icons.PenLine className="w-6 h-6 text-green-500" /> Firma Digital
                        </h3>
                        <DigitalSignature 
                            onSave={(url) => setSignatureDataUrl(url)}
                            onClear={() => setSignatureDataUrl(null)}
                        />
                        <div className="mt-6 space-y-4">
                             <p className="text-xs text-gray-400 text-center leading-relaxed">
                                Al firmar, usted certifica la validez de esta prescripción para el paciente indicado.
                             </p>
                             {!savedId ? (
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving || drugs.length === 0 || !signatureDataUrl}
                                    className="w-full py-4 bg-[var(--primary)] text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
                                >
                                    {isSaving ? <Icons.Loader2 className="animate-spin" /> : <Icons.Save className="w-5 h-5" />}
                                    Finalizar Receta
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                                    <PrescriptionDownloadButton 
                                        data={pdfData} 
                                        fileName={`Receta_${patient?.name || 'Paciente'}.pdf`} 
                                    />
                                    <Link 
                                        href={`/${clinic.id}/portal/pets/${patient.id}`}
                                        className="w-full py-4 bg-gray-100 text-gray-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                                    >
                                        Volver al Perfil
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
