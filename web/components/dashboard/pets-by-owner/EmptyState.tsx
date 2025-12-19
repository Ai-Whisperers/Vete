import { User } from "lucide-react";

export function EmptyState(): React.ReactElement {
  return (
    <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
      <div className="text-center p-8">
        <User className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
          Selecciona un propietario
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Elige un propietario de la lista para ver sus mascotas
        </p>
      </div>
    </div>
  );
}
