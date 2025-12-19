import { Search } from "lucide-react";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export function SearchHeader({ searchQuery, onSearchChange, resultCount }: SearchHeaderProps): React.ReactElement {
  return (
    <div className="p-4 border-b border-[var(--border-color)]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Buscar propietario o mascota..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">
        {resultCount} propietario{resultCount !== 1 ? "s" : ""}
        {searchQuery && ` encontrado${resultCount !== 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
