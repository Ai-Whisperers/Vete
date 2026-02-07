/**
 * Analytics validation schemas
 */

import { z } from 'zod'

/**
 * Schema for store analytics query parameters
 */
export const storeAnalyticsQuerySchema = z.object({
  period: z.coerce.number().int().min(1).max(365).default(30),
  topProducts: z.coerce.number().int().min(1).max(100).default(10),
})

export type StoreAnalyticsQueryInput = z.infer<typeof storeAnalyticsQuerySchema>

/**
 * Schema for analytics export query parameters
 */
export const analyticsExportQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
})

export type AnalyticsExportQueryInput = z.infer<typeof analyticsExportQuerySchema>

/**
 * Schema for web vitals metrics
 */
export const webVitalsSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']),
  value: z.number(),
  id: z.string().optional(),
  delta: z.number().optional(),
  navigationType: z.string().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
})

export type WebVitalsInput = z.infer<typeof webVitalsSchema>

/**
 * Schema for turnover analytics query
 */
export const turnoverQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
})

export type TurnoverQueryInput = z.infer<typeof turnoverQuerySchema>

/**
 * Schema for margins analytics query
 */
export const marginsQuerySchema = z.object({
  period: z.coerce.number().int().min(1).max(365).default(30),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type MarginsQueryInput = z.infer<typeof marginsQuerySchema>
