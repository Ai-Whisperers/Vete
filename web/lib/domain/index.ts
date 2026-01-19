/**
 * Domain layer
 * Contains all business domains with their repositories and services
 */

// ===========================================================================
// FACTORY
// ===========================================================================

export { DomainFactory, getDomainFactory } from './factory'

// ===========================================================================
// CORE DOMAINS
// ===========================================================================

export * from './appointments'
export * from './pets'
export * from './invoices'
export * from './payments'
// TODO: Migrate UserService to domain pattern
// export * from './users'

// ===========================================================================
// CLINICAL DOMAINS
// ===========================================================================

export * from './medical-records'
export * from './hospitalizations'
export * from './lab'
export * from './vaccines'
export * from './clinical-tools'

// ===========================================================================
// OPERATIONAL DOMAINS
// ===========================================================================

// TODO: Migrate these services to domain pattern
// export * from './inventory'
// export * from './store'
// export * from './consent'

// ===========================================================================
// COMMUNICATION DOMAINS
// ===========================================================================

export * from './messaging'
export * from './reminders'

// ===========================================================================
// PUBLIC HEALTH DOMAINS
// ===========================================================================

export * from './safety'
