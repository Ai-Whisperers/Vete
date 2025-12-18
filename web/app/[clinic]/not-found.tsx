import Link from 'next/link';
import { PawPrint, Home, ArrowLeft } from 'lucide-react';

/**
 * Clinic-specific 404 page - uses theme variables
 */
export default function ClinicNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-[var(--bg-subtle)] rounded-full flex items-center justify-center">
            <PawPrint className="w-16 h-16 text-[var(--primary)] opacity-50" />
          </div>
        </div>

        {/* Error Info */}
        <h1 className="text-6xl font-black text-[var(--primary)] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Página no encontrada
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe. Puede que haya sido movida o eliminada.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="./"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Página anterior
          </button>
        </div>
      </div>
    </div>
  );
}
