'use client'

import { useState, useCallback, useMemo, useRef, FormEvent } from 'react'
import { z, ZodSchema, ZodError } from 'zod'

/**
 * Form submission status
 */
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Field error map
 */
export type FieldErrors<T> = Partial<Record<keyof T, string>>

/**
 * Result of useFormState hook
 */
export interface FormStateResult<T extends Record<string, unknown>> {
  /** Current form values */
  values: T
  /** Field-level errors from validation */
  errors: FieldErrors<T>
  /** General form error (non-field specific) */
  formError: string | undefined
  /** Current form status */
  status: FormStatus
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Whether form has been modified from initial values */
  isDirty: boolean
  /** Whether form passed validation */
  isValid: boolean
  /** Update a single field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  /** Update multiple field values at once */
  setValues: (values: Partial<T>) => void
  /** Set an error for a specific field */
  setError: <K extends keyof T>(field: K, error: string) => void
  /** Set the general form error */
  setFormError: (error: string) => void
  /** Clear all errors */
  clearErrors: () => void
  /** Reset form to initial values */
  reset: () => void
  /** Validate the form without submitting */
  validate: () => boolean
  /** Handle form submission */
  handleSubmit: (e: FormEvent) => void
  /** Create an onChange handler for a field */
  getFieldProps: <K extends keyof T>(field: K) => {
    name: K
    value: T[K]
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    onBlur: () => void
  }
  /** Get checkbox props for boolean fields */
  getCheckboxProps: <K extends keyof T>(field: K) => {
    name: K
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
}

/**
 * Options for useFormState hook
 */
export interface UseFormStateOptions<T extends Record<string, unknown>> {
  /** Initial form values */
  initialValues: T
  /** Zod schema for validation (optional) */
  schema?: ZodSchema<T>
  /** Called on successful form submission */
  onSubmit: (values: T) => Promise<void> | void
  /** Called when validation or submission fails */
  onError?: (errors: FieldErrors<T> | Error) => void
  /** Called on successful submission */
  onSuccess?: () => void
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean
  /** Validate on change (default: false) */
  validateOnChange?: boolean
  /** Reset form after successful submission (default: false) */
  resetOnSuccess?: boolean
}

/**
 * Hook for managing form state with validation, submission, and error handling.
 * Integrates with Zod schemas for type-safe validation.
 *
 * @example
 * ```typescript
 * const petSchema = z.object({
 *   name: z.string().min(1, 'Nombre requerido'),
 *   species: z.enum(['dog', 'cat']),
 *   weight: z.number().positive('Peso debe ser positivo'),
 * })
 *
 * function PetForm() {
 *   const form = useFormState({
 *     initialValues: { name: '', species: 'dog', weight: 0 },
 *     schema: petSchema,
 *     onSubmit: async (values) => {
 *       await createPet(values)
 *     },
 *     onSuccess: () => toast.success('Mascota creada'),
 *   })
 *
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.getFieldProps('name')} />
 *       {form.errors.name && <span className="error">{form.errors.name}</span>}
 *
 *       <select {...form.getFieldProps('species')}>
 *         <option value="dog">Perro</option>
 *         <option value="cat">Gato</option>
 *       </select>
 *
 *       <button type="submit" disabled={form.isSubmitting}>
 *         {form.isSubmitting ? 'Guardando...' : 'Guardar'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useFormState<T extends Record<string, unknown>>(
  options: UseFormStateOptions<T>
): FormStateResult<T> {
  const {
    initialValues,
    schema,
    onSubmit,
    onError,
    onSuccess,
    validateOnBlur = true,
    validateOnChange = false,
    resetOnSuccess = false,
  } = options

  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FieldErrors<T>>({})
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [touched, setTouched] = useState<Set<keyof T>>(new Set())

  // Track initial values for dirty checking
  const initialValuesRef = useRef(initialValues)

  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    )
  }, [values])

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | undefined => {
      if (!schema) return undefined

      try {
        // Validate just this field by parsing the full object
        schema.parse({ ...values, [field]: value })
        return undefined
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldError = err.issues.find((issue) => issue.path[0] === field)
          return fieldError?.message
        }
        return undefined
      }
    },
    [schema, values]
  )

  const validateForm = useCallback((): boolean => {
    if (!schema) return true

    try {
      schema.parse(values)
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors: FieldErrors<T> = {}
        err.issues.forEach((issue) => {
          const field = issue.path[0] as keyof T
          if (!newErrors[field]) {
            newErrors[field] = issue.message
          }
        })
        setErrors(newErrors)
        onError?.(newErrors)
        return false
      }
      return false
    }
  }, [schema, values, onError])

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }))

      if (validateOnChange) {
        const error = validateField(field, value)
        setErrors((prev) => {
          if (error) {
            return { ...prev, [field]: error }
          }
          const { [field]: _, ...rest } = prev
          return rest as FieldErrors<T>
        })
      }
    },
    [validateOnChange, validateField]
  )

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }))
  }, [])

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setFormError(undefined)
  }, [])

  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current)
    setErrors({})
    setFormError(undefined)
    setStatus('idle')
    setTouched(new Set())
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setStatus('submitting')
      setFormError(undefined)

      try {
        await onSubmit(values)
        setStatus('success')
        onSuccess?.()

        if (resetOnSuccess) {
          reset()
        }
      } catch (err) {
        setStatus('error')
        const error = err instanceof Error ? err : new Error(String(err))
        setFormError(error.message)
        onError?.(error)
      }
    },
    [values, validateForm, onSubmit, onSuccess, onError, resetOnSuccess, reset]
  )

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      value: values[field],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
        setValue(field, value as T[K])
      },
      onBlur: () => {
        setTouched((prev) => new Set([...prev, field]))
        if (validateOnBlur) {
          const error = validateField(field, values[field])
          setErrors((prev) => {
            if (error) {
              return { ...prev, [field]: error }
            }
            const { [field]: _, ...rest } = prev
            return rest as FieldErrors<T>
          })
        }
      },
    }),
    [values, setValue, validateOnBlur, validateField]
  )

  const getCheckboxProps = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      checked: Boolean(values[field]),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.checked as T[K])
      },
    }),
    [values, setValue]
  )

  return {
    values,
    errors,
    formError,
    status,
    isSubmitting: status === 'submitting',
    isDirty,
    isValid,
    setValue,
    setValues,
    setError,
    setFormError,
    clearErrors,
    reset,
    validate: validateForm,
    handleSubmit,
    getFieldProps,
    getCheckboxProps,
  }
}
