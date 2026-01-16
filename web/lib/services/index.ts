/**
 * Service Layer - Barrel Export
 *
 * All domain services are exported from this file for convenient importing.
 *
 * @example
 * ```typescript
 * import { AppointmentService, InvoiceService } from '@/lib/services';
 * import type { ServiceResult } from '@/lib/services';
 * ```
 */

// Base service and types
export { BaseService, type ServiceResult, type ServiceSuccess, type ServiceError } from './base-service';

// Domain services
export { AppointmentService, type AppointmentListFilters, type SlotAvailabilityOptions } from './appointment-service';
export { 
  InvoiceService, 
  type InvoiceListFilters, 
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
  type RevenueSummary
} from './invoice-service';
export { 
  PetService, 
  type PetListFilters,
  type CreatePetData,
  type UpdatePetData
} from './pet-service';
export {
  PaymentService,
  type ProcessPaymentInput,
  type PaymentListFilters,
  type Payment,
  type PaymentWithInvoice,
  type PaymentMethod,
  type PaymentStatus
} from './payment-service';
export {
  StoreService,
  type Product,
  type ProductWithStock,
  type Cart,
  type CartItem,
  type Order,
  type OrderWithItems,
  type CheckoutInput,
  type ProductFilters
} from './store-service';

// Add more services as they're created:
// export { InventoryService } from './inventory-service';
