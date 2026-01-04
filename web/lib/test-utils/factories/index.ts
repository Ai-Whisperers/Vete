/**
 * Factory Index - Exports all builder-pattern factories
 *
 * Usage:
 * ```typescript
 * import { OwnerFactory, PetFactory, AppointmentFactory } from '@/lib/test-utils/factories';
 *
 * // Create an owner with VIP persona
 * const owner = await OwnerFactory.create()
 *   .forTenant('adris')
 *   .withPersona('vip')
 *   .build();
 *
 * // Create a pet with vaccines
 * const { pet, vaccines } = await PetFactory.create()
 *   .forTenant('adris')
 *   .forOwner(owner.id)
 *   .asDog('Labrador')
 *   .withVaccines()
 *   .build();
 *
 * // Create appointment history
 * const appointments = await createAppointmentHistory(
 *   pet.id,
 *   owner.id,
 *   vetId,
 *   'adris',
 *   { past: 5, future: 2, includeRecords: true }
 * );
 * ```
 */

// Types
export * from './types'

// Base utilities
export {
  generateId,
  generateSequence,
  resetSequence,
  randomBusinessDate,
  randomPastDate,
  randomFutureDate,
  randomPhone,
  randomEmail,
  randomWeight,
  randomBirthDate,
  randomAmount,
  pick,
  pickN,
  PARAGUAYAN_FIRST_NAMES,
  PARAGUAYAN_LAST_NAMES,
  DOG_BREEDS,
  CAT_BREEDS,
  PET_NAMES,
  PET_COLORS,
} from './base'

// Owner factory
export {
  OwnerFactory,
  createDistinctOwners,
  createPredefinedOwners,
  PREDEFINED_OWNERS,
} from './owner-factory'

// Pet factory
export { PetFactory, createPetsForOwner } from './pet-factory'

// Appointment factory
export { AppointmentFactory, createAppointmentHistory } from './appointment-factory'

// Invoice & Payment factory
export { InvoiceFactory, createInvoiceHistory } from './invoice-factory'

// Loyalty factory
export {
  LoyaltyFactory,
  createLoyaltyFromPurchases,
  createLoyaltyForPersona,
} from './loyalty-factory'

// Store order factory
export {
  StoreOrderFactory,
  CartFactory,
  createOrderHistory,
  createAbandonedCarts,
} from './store-order-factory'
