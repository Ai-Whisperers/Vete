import React, { useState, useCallback, useRef } from 'react'

export type ValidationRule<T> = (value: T, formData?: Record<string, any>) => string | null

export interface FormField<T = any> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface UseFormOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  initialValues?: Record<string, any>
  validationRules?: Record<string, ValidationRule<any>>
}

export interface UseFormResult {
  values: Record<string, any>
  errors: Record<string, string | null>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
  setValue: (field: string, value: any) => void
  setError: (field: string, error: string | null) => void
  setTouched: (field: string, touched?: boolean) => void
  validateField: (field: string) => boolean
  validateForm: () => boolean
  reset: (values?: Record<string, any>) => void
  handleSubmit: (
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  ) => (e?: React.FormEvent) => Promise<void>
  getFieldProps: (field: string) => {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    error: string | null
    touched: boolean
  }
}

export function useForm(options: UseFormOptions = {}): UseFormResult {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    initialValues = {},
    validationRules = {},
  } = options

  const [formState, setFormState] = useState<FormState>(() =>
    Object.keys(initialValues).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          value: initialValues[key],
          error: null,
          touched: false,
          dirty: false,
        },
      }),
      {}
    )
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialValuesRef = useRef(initialValues)

  const setValue = useCallback(
    (field: string, value: any) => {
      setFormState((prev) => {
        const currentField = prev[field] || {
          value: undefined,
          error: null,
          touched: false,
          dirty: false,
        }
        const newValue = typeof value === 'object' && value?.target ? value.target.value : value
        const dirty = newValue !== initialValuesRef.current[field]

        return {
          ...prev,
          [field]: {
            ...currentField,
            value: newValue,
            dirty,
            error:
              validateOnChange && validationRules[field]
                ? validationRules[field](newValue, getValuesFromState(prev))
                : currentField.error,
          },
        }
      })
    },
    [validateOnChange, validationRules]
  )

  const setError = useCallback((field: string, error: string | null) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }))
  }, [])

  const setTouched = useCallback(
    (field: string, touched = true) => {
      setFormState((prev) => {
        const currentField = prev[field] || {
          value: undefined,
          error: null,
          touched: false,
          dirty: false,
        }

        return {
          ...prev,
          [field]: {
            ...currentField,
            touched,
            error:
              validateOnBlur && touched && validationRules[field]
                ? validationRules[field](currentField.value, getValuesFromState(prev))
                : currentField.error,
          },
        }
      })
    },
    [validateOnBlur, validationRules]
  )

  const validateField = useCallback(
    (field: string): boolean => {
      const rule = validationRules[field]
      if (!rule) return true

      const values = getValuesFromState(formState)
      const error = rule(formState[field]?.value, values)

      setError(field, error)
      return error === null
    },
    [formState, validationRules, setError]
  )

  const validateForm = useCallback((): boolean => {
    let isValid = true

    Object.keys(validationRules).forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })

    return isValid
  }, [validationRules, validateField])

  const reset = useCallback((values: Record<string, any> = initialValuesRef.current) => {
    initialValuesRef.current = values
    setFormState(
      Object.keys(values).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: values[key],
            error: null,
            touched: false,
            dirty: false,
          },
        }),
        {}
      )
    )
    setIsSubmitting(false)
  }, [])

  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, any>) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault()
        }
        setIsSubmitting(true)

        try {
          const values = getValuesFromState(formState)
          await onSubmit(values)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [formState]
  )

  const getFieldProps = useCallback(
    (field: string) => ({
      value: formState[field]?.value || '',
      onChange: (value: any) => setValue(field, value),
      onBlur: () => setTouched(field),
      error: formState[field]?.error || null,
      touched: formState[field]?.touched || false,
    }),
    [formState, setValue, setTouched]
  )

  const values = getValuesFromState(formState)
  const errors = getErrorsFromState(formState)
  const touched = getTouchedFromState(formState)
  const dirty = getDirtyFromState(formState)

  const isValid = Object.values(errors).every((error) => error === null)
  const isDirty = Object.values(dirty).some((d) => d)

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    validateField,
    validateForm,
    reset,
    handleSubmit,
    getFieldProps,
  }
}

// Helper functions
function getValuesFromState(state: FormState): Record<string, any> {
  return Object.keys(state).reduce(
    (acc, key) => ({
      ...acc,
      [key]: state[key].value,
    }),
    {}
  )
}

function getErrorsFromState(state: FormState): Record<string, string | null> {
  return Object.keys(state).reduce(
    (acc, key) => ({
      ...acc,
      [key]: state[key].error,
    }),
    {}
  )
}

function getTouchedFromState(state: FormState): Record<string, boolean> {
  return Object.keys(state).reduce(
    (acc, key) => ({
      ...acc,
      [key]: state[key].touched,
    }),
    {}
  )
}

function getDirtyFromState(state: FormState): Record<string, boolean> {
  return Object.keys(state).reduce(
    (acc, key) => ({
      ...acc,
      [key]: state[key].dirty,
    }),
    {}
  )
}
