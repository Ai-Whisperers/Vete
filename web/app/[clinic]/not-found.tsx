import Link from "next/link";
import { Home, ArrowLeft, PawPrint, Search } from "lucide-react";

/**
 * Clinic-scoped 404 page - shown when no route matches within a clinic
 * Uses clinic theme variables for consistent branding
 */
export default function ClinicNotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Paw */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] rounded-full flex items-center justify-center shadow-xl shadow-[var(--primary)]/20">
            <PawPrint className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/10 rounded-full blur-sm" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-black text-gray-200 mb-2">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Página no encontrada
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          Parece que esta página se escapó del corral.
          No te preocupes, te ayudamos a volver al camino correcto.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="../"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--primary)]/20"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
          <Link
            href="../services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[var(--text-primary)] font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <Search className="w-5 h-5" />
            Ver Servicios
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/10">
          <p className="text-sm text-[var(--text-secondary)]">
            ¿Necesitas ayuda? Contáctanos por WhatsApp o visita nuestra página de contacto.
          </p>
        </div>
      </div>
    </div>
  );
}
