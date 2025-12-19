'use client'

import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  hint?: string
  min?: string
  max?: string
}

/**
 * DatePicker component - Native HTML date input with styling
 *
 * Features:
 * - Native browser date picker (best for mobile)
 * - Label, error, and hint support
 * - Min/max date validation
 * - Calendar icon indicator
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Fecha de nacimiento"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   max={new Date().toISOString().split('T')[0]}
 *   required
 * />
 * ```
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      hint,
      min,
      max,
      disabled,
      className,
      placeholder = 'dd/mm/aaaa',
      ...props
    },
    ref
  ) => {
    return (
      <Input
        ref={ref}
        type="date"
        label={label}
        error={error}
        hint={hint}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        rightIcon={<Calendar className="h-4 w-4" aria-hidden="true" />}
        {...props}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'
