/**
 * Barrel export for all types
 * Import from '@/lib/types' instead of individual files
 */

// Configuration types
export type * from './clinic-config';

// Status types and transitions
export * from './status';

// Business domain types
export type * from './appointments';
export type * from './invoicing';
export type * from './store';
export type * from './services';
export type * from './whatsapp';
export type * from './calendar';

// Database types
export type * from './database';

// System types
export type * from './audit';
export type * from './notification';
export type * from './reports';
export type * from './settings';
export type * from './staff';

// Utility types
export type * from './action-result';
export type * from './errors';
