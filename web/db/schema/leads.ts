import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  country: text('country').notNull(),
  programInterest: text('program_interest'),
  objective: text('objective'),
  locale: text('locale').default('nl'),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
