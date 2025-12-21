import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FilterOption } from '@/hooks/use-filter-data';

interface FilterSectionProps<T extends FilterOption> {
  title: string;
  options: T[];
  selectedValue: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isLoading: boolean;
  renderOption: (option: T) => React.ReactNode;
  showCounts?: boolean;
  allLabel?: string;
}

export function FilterSection<T extends FilterOption>({
  title,
  options,
  selectedValue,
  onChange,
  isExpanded,
  onToggle,
  isLoading,
  renderOption,
  showCounts = false,
  allLabel = `Todas las ${title.toLowerCase()}`
}: FilterSectionProps<T>) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2 ml-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
      >
        <h4 className="font-bold text-gray-900">{title}</h4>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2">
            <input
              type="radio"
              name={title.toLowerCase()}
              value="all"
              checked={selectedValue === 'all'}
              onChange={(e) => onChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${selectedValue === 'all' ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
              {allLabel}
            </span>
          </label>

          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2">
              <input
                type="radio"
                name={title.toLowerCase()}
                value={option.slug}
                checked={selectedValue === option.slug}
                onChange={(e) => onChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className={`flex-1 ${selectedValue === option.slug ? 'text-blue-600' : 'text-gray-600'}`}>
                {renderOption(option)}
              </div>
              {showCounts && option.count !== undefined && (
                <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                  ({option.count})
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
