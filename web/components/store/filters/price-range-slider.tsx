'use client';

import { useState, useEffect, useCallback } from 'react';

interface Props {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  currencySymbol?: string;
}

export default function PriceRangeSlider({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  currencySymbol = 'Gs',
}: Props) {
  const [localMin, setLocalMin] = useState<string>(currentMin?.toString() || '');
  const [localMax, setLocalMax] = useState<string>(currentMax?.toString() || '');
  const [sliderMin, setSliderMin] = useState(currentMin ?? min);
  const [sliderMax, setSliderMax] = useState(currentMax ?? max);

  // Update local state when props change
  useEffect(() => {
    setLocalMin(currentMin?.toString() || '');
    setLocalMax(currentMax?.toString() || '');
    setSliderMin(currentMin ?? min);
    setSliderMax(currentMax ?? max);
  }, [currentMin, currentMax, min, max]);

  const debouncedOnChange = useCallback(
    debounce((minVal: number | undefined, maxVal: number | undefined) => {
      onChange(minVal, maxVal);
    }, 500),
    [onChange]
  );

  const handleMinInputChange = (value: string) => {
    setLocalMin(value);
    const numValue = parseInt(value) || undefined;
    if (numValue === undefined || numValue >= min) {
      setSliderMin(numValue ?? min);
      debouncedOnChange(numValue, currentMax);
    }
  };

  const handleMaxInputChange = (value: string) => {
    setLocalMax(value);
    const numValue = parseInt(value) || undefined;
    if (numValue === undefined || numValue <= max) {
      setSliderMax(numValue ?? max);
      debouncedOnChange(currentMin, numValue);
    }
  };

  const handleSliderMinChange = (value: number) => {
    if (value <= sliderMax) {
      setSliderMin(value);
      setLocalMin(value.toString());
      debouncedOnChange(value === min ? undefined : value, currentMax);
    }
  };

  const handleSliderMaxChange = (value: number) => {
    if (value >= sliderMin) {
      setSliderMax(value);
      setLocalMax(value.toString());
      debouncedOnChange(currentMin, value === max ? undefined : value);
    }
  };

  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined) return `${currencySymbol} 0`;
    return `${currencySymbol} ${value.toLocaleString('es-PY')}`;
  };

  const range = max - min;
  const minPercent = ((sliderMin - min) / range) * 100;
  const maxPercent = ((sliderMax - min) / range) * 100;

  return (
    <div className="space-y-4">
      {/* Input Fields */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Mínimo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => handleMinInputChange(e.target.value)}
              placeholder={(min ?? 0).toLocaleString('es-PY')}
              className="w-full pl-8 pr-2 py-2 text-sm border border-[var(--border-default)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
        <span className="text-[var(--text-muted)] mt-5">-</span>
        <div className="flex-1">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Máximo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxInputChange(e.target.value)}
              placeholder={(max ?? 0).toLocaleString('es-PY')}
              className="w-full pl-8 pr-2 py-2 text-sm border border-[var(--border-default)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative h-2 mt-6">
        {/* Track Background */}
        <div className="absolute inset-0 bg-gray-200 rounded-full" />

        {/* Active Track */}
        <div
          className="absolute h-full bg-[var(--primary)] rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={sliderMin}
          onChange={(e) => handleSliderMinChange(parseInt(e.target.value))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--primary)] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={sliderMax}
          onChange={(e) => handleSliderMaxChange(parseInt(e.target.value))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--primary)] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}

// Debounce utility
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
