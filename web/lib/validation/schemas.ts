/**
 * Predefined validation schemas
 * Common validation rules for domain entities
 */

import type { ValidationSchema } from './types'

// User/Profile validations
export const userProfileSchema: ValidationSchema = {
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  email: {
    required: true,
    email: true,
    maxLength: 255,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Formato de teléfono inválido',
  },
}

// Pet validations
export const petSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  species: {
    required: true,
    custom: (value) => ['dog', 'cat', 'bird', 'rabbit', 'other'].includes(value),
    message: 'Especie inválida',
  },
  breed: {
    maxLength: 50,
  },
  date_of_birth: {
    custom: (value) => {
      if (!value) return true
      const date = new Date(value)
      const now = new Date()
      return date <= now && date >= new Date('1900-01-01')
    },
    message: 'Fecha de nacimiento inválida',
  },
  gender: {
    custom: (value) => !value || ['male', 'female'].includes(value),
    message: 'Género debe ser macho o hembra',
  },
  weight_kg: {
    min: 0.1,
    max: 200,
    custom: (value) =>
      value === undefined || value === null || (typeof value === 'number' && value > 0),
  },
  color: {
    maxLength: 50,
  },
  microchip_number: {
    pattern: /^[\d]{10,15}$/,
    message: 'Número de microchip debe tener entre 10 y 15 dígitos',
  },
}

// Appointment validations
export const appointmentSchema: ValidationSchema = {
  pet_id: {
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    message: 'ID de mascota inválido',
  },
  start_time: {
    required: true,
    custom: (value) => {
      const date = new Date(value)
      return date > new Date() && date.getTime() === date.getTime() // Valid date and in future
    },
    message: 'Fecha de inicio debe ser en el futuro',
  },
  end_time: {
    required: true,
    custom: (value, data) => {
      if (!data?.start_time) return false
      const start = new Date(data.start_time)
      const end = new Date(value)
      return end > start && end.getTime() - start.getTime() <= 4 * 60 * 60 * 1000 // Max 4 hours
    },
    message: 'Fecha de fin debe ser posterior a inicio y máximo 4 horas',
  },
  reason: {
    maxLength: 500,
  },
  notes: {
    maxLength: 1000,
  },
}

// Contact form validations
export const contactFormSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    required: true,
    email: true,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Formato de teléfono inválido',
  },
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  },
  clinic_slug: {
    required: true,
    minLength: 1,
    maxLength: 50,
  },
}

// Inventory/Product validations
export const productSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  price: {
    required: true,
    min: 0,
    max: 999999.99,
  },
  cost_price: {
    min: 0,
    max: 999999.99,
    custom: (value, data) => {
      if (value && data?.price) {
        return value <= data.price
      }
      return true
    },
    message: 'Precio de costo no puede ser mayor al precio de venta',
  },
  stock_quantity: {
    required: true,
    min: 0,
    max: 99999,
  },
  min_stock_level: {
    min: 0,
    custom: (value, data) => {
      if (value && data?.stock_quantity) {
        return value <= data.stock_quantity
      }
      return true
    },
    message: 'Nivel mínimo no puede ser mayor al stock actual',
  },
  sku: {
    pattern: /^[A-Z0-9\-_]{3,20}$/i,
    message: 'SKU debe contener solo letras, números, guiones y underscores (3-20 caracteres)',
  },
  barcode: {
    pattern: /^[\d]{8,18}$/,
    message: 'Código de barras debe tener entre 8 y 18 dígitos',
  },
}

// Invoice validations
export const invoiceSchema: ValidationSchema = {
  client_id: {
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  items: {
    required: true,
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'La factura debe tener al menos un item',
  },
  subtotal: {
    required: true,
    min: 0,
  },
  tax_amount: {
    min: 0,
  },
  total: {
    required: true,
    min: 0,
    custom: (value, data) => {
      if (data?.subtotal && data?.tax_amount) {
        return Math.abs(value - (data.subtotal + data.tax_amount)) < 0.01 // Allow small rounding differences
      }
      return true
    },
    message: 'Total no coincide con subtotal + impuestos',
  },
  due_date: {
    custom: (value) => {
      if (!value) return true
      const date = new Date(value)
      return date >= new Date()
    },
    message: 'Fecha de vencimiento debe ser hoy o en el futuro',
  },
  notes: {
    maxLength: 500,
  },
}
