/**
 * Service Layer Exports
 *
 * Central export point for all business logic services.
 * Services encapsulate database operations, validation, and business rules.
 *
 * @example
 * ```typescript
 * import { PetService, AppointmentService } from '@/lib/services';
 *
 * const petService = new PetService(supabase);
 * const result = await petService.list(ownerId, tenantId);
 * ```
 */

export { BaseService } from './base-service';
export type { ServiceResult } from './base-service';

export { PetService } from './pet-service';
export type {
  PetListFilters,
  CreatePetData,
  UpdatePetData,
} from './pet-service';

export { AppointmentService } from './appointment-service';
export type {
  AppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentData,
  CheckInData,
  CompleteAppointmentData,
  CancelAppointmentData,
  AvailableSlot,
  SlotFilters,
} from './appointment-service';

export { InvoiceService } from './invoice-service';
export type {
  InvoiceFilters,
  CreateInvoiceData,
  InvoiceLineItem,
  PaymentData,
  RefundData,
} from './invoice-service';

export { PaymentService } from './payment-service';
export type {
  PaymentFilters,
  ProcessPaymentData,
  UpdatePaymentStatusData,
} from './payment-service';

export { StoreService } from './store-service';
export type {
  ProductFilters,
  CartItem,
  CheckoutData,
} from './store-service';

export { MedicalRecordService } from './medical-record-service';
export type {
  MedicalRecordType,
  VaccineStatus,
  MedicalRecord,
  Vaccine,
  Prescription,
  CreateMedicalRecordData,
  CreateVaccineData,
  CreatePrescriptionData,
  MedicalRecordFilters,
  VaccineFilters,
} from './medical-record-service';

// Add more services as they're created:
// export { InventoryService } from './inventory-service';
// export { UserService } from './user-service';
// export { MessagingService } from './messaging-service';
