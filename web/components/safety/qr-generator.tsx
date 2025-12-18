"use client";

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QRGeneratorProps {
    petId: string;
    petName: string;
}

export function QRGenerator({ petId, petName }: QRGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCode, setQrCode] = useState<{ url: string; scanUrl: string } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    const generateQR = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/pets/${petId}/qr`, {
                method: 'POST'
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate QR code');
            }

            const data = await res.json();
            setQrCode(data.qrCode);
            setShowModal(true);
            showToast('Código QR generado exitosamente');
        } catch (e) {
            // TICKET-TYPE-004: Proper error handling without any
            showToast(e instanceof Error ? e.message : 'Error al generar código QR');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadQR = () => {
        if (!qrCode) return;
        
        const link = document.createElement('a');
        link.href = qrCode.url;
        link.download = `${petName}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Descargando código QR...');
    };

    return (
        <>
            <button
                onClick={generateQR}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
            >
                {isGenerating ? (
                    <Icons.Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Icons.QrCode className="w-5 h-5" />
                )}
                Generar Código QR
            </button>

            {/* Modal */}
            {showModal && qrCode && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                        >
                            <Icons.X className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Icons.QrCode className="w-8 h-8 text-[var(--primary)]" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Código QR Listo</h2>
                            <p className="text-gray-500 mb-8">Para {petName}</p>

                            {/* QR Code Display */}
                            <div className="bg-white p-6 rounded-2xl border-4 border-gray-100 mb-8 inline-block">
                                <img 
                                    src={qrCode.url} 
                                    alt={`QR Code for ${petName}`}
                                    className="w-64 h-64 mx-auto"
                                />
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6 text-left">
                                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                                    <Icons.Info className="w-5 h-5" />
                                    Cómo usar este código
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <Icons.Check className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>Descarga e imprime el código QR</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Icons.Check className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>Colócalo en el collar o placa de identificación</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Icons.Check className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>Si alguien encuentra a tu mascota, puede escanear el código para ver tu contacto</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={downloadQR}
                                    className="flex-1 px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <Icons.Download className="w-5 h-5" />
                                    Descargar PNG
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
