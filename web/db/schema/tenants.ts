import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('Paraguay'),
  ruc: text('ruc'),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  settings: jsonb('settings').default({}),
  businessHours: jsonb('business_hours').default({}),
  featuresEnabled: text('features_enabled').array().default(['core']),
  plan: text('plan').default('free'),
  planExpiresAt: timestamp('plan_expires_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
