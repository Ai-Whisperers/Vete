import { PawPrint, ChevronRight } from "lucide-react";
import type { Owner } from "./types";
import { isClientActive } from "./utils";

interface OwnerListItemProps {
  owner: Owner;
  isSelected: boolean;
  onClick: () => void;
}

export function OwnerListItem({ owner, isSelected, onClick }: OwnerListItemProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left transition-colors hover:bg-[var(--bg-subtle)] ${
        isSelected
          ? "bg-[var(--primary)] bg-opacity-5 border-l-4 border-l-[var(--primary)]"
          : "border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--primary)] font-semibold">
            {owner.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {owner.full_name}
            </p>
            {isClientActive(owner.last_visit) ? (
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" title="Activo" />
            ) : (
              <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full" title="Inactivo" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <PawPrint className="w-3 h-3" />
            <span>
              {owner.pets.length} mascota{owner.pets.length !== 1 ? "s" : ""}
            </span>
            {owner.phone && (
              <>
                <span className="text-[var(--border-color)]">•</span>
                <span className="truncate">{owner.phone}</span>
              </>
            )}
          </div>
        </div>

        <ChevronRight
          className={`w-5 h-5 flex-shrink-0 transition-colors ${
            isSelected
              ? "text-[var(--primary)]"
              : "text-[var(--text-secondary)]"
          }`}
        />
      </div>
    </button>
  );
}
