/**
 * Reusable form field components with validation
 */

'use client'

import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface BaseFieldProps {
  label?: string
  error?: FieldError
  required?: boolean
  description?: string
  className?: string
}

export interface TextFieldProps extends BaseFieldProps {
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, required, description, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          {...props}
          className={cn(
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }
)
TextField.displayName = 'TextField'

export interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  rows?: number
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, required, description, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          {...props}
          className={cn(
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }
)
TextareaField.displayName = 'TextareaField'

export interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ label, error, required, description, className, options, placeholder, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}
        <Select {...props}>
          <SelectTrigger
            ref={ref}
            className={cn(error && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }
)
SelectField.displayName = 'SelectField'

export interface CheckboxFieldProps extends BaseFieldProps {
  description?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, required, description, className, ...props }, ref) => {
    return (
      <div className={cn('flex items-start space-x-2', className)}>
        <Checkbox
          ref={ref}
          id={props.id}
          {...props}
          className={cn(error && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
        />
        <div className="space-y-1">
          {label && (
            <Label htmlFor={props.id} className="cursor-pointer text-sm font-medium">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </Label>
          )}
          {description && <p className="text-sm text-gray-600">{description}</p>}
          {error && <p className="text-sm text-red-600">{error.message}</p>}
        </div>
      </div>
    )
  }
)
CheckboxField.displayName = 'CheckboxField'

export interface RadioGroupFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const RadioGroupField = forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  ({ label, error, required, description, className, options, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}
        <RadioGroup ref={ref} {...props} className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} disabled={option.disabled} />
              <Label htmlFor={option.value} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }
)
RadioGroupField.displayName = 'RadioGroupField'
