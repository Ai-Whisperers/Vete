/**
 * Domain layer
 * Contains all business domains with their repositories and services
 */

// Factory for creating domain services
export { DomainFactory, getDomainFactory } from './factory'

// Appointments domain
export * from './appointments'

// Pets domain
export * from './pets'
