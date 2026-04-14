import type { SupabaseClient } from '@supabase/supabase-js'
import { AppointmentService } from './core/appointments'
import { InvoiceService } from './core/invoices'
import { PaymentService } from './core/payments'
import { UserService } from './core/users'
import { InventoryService } from './core/inventory'
import { ConsentService } from './core/consent'
import { StoreService } from './core/store'
import { MessagingService } from './core/messaging'
import { ReminderService } from './core/reminders'
import { PetService } from './verticals/clinic/pets'
import { MedicalRecordRepository } from './verticals/clinic/medical-records'
import { HospitalizationRepository } from './verticals/clinic/hospitalizations'
import { LabRepository } from './verticals/clinic/lab'
import { ClinicalToolsService } from './verticals/clinic/clinical-tools'
import { VaccineService } from './verticals/clinic/vaccines'
import { SafetyService } from './verticals/clinic/safety'

export class DomainFactory {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // CORE DOMAINS — All tenants
  // ===========================================================================

  createAppointmentService(): AppointmentService {
    return new AppointmentService(this.supabase)
  }

  createInvoiceService(): InvoiceService {
    return new InvoiceService(this.supabase)
  }

  createPaymentService(): PaymentService {
    return new PaymentService(this.supabase)
  }

  createUserService(): UserService {
    return new UserService(this.supabase)
  }

  createInventoryService(): InventoryService {
    return new InventoryService(this.supabase)
  }

  createStoreService(): StoreService {
    return new StoreService(this.supabase)
  }

  createConsentService(): ConsentService {
    return new ConsentService(this.supabase)
  }

  createMessagingService(): MessagingService {
    return new MessagingService(this.supabase)
  }

  createReminderService(): ReminderService {
    return new ReminderService(this.supabase)
  }

  // ===========================================================================
  // CLINIC VERTICAL — Pet clinics + Human clinics
  // ===========================================================================

  createPetService(): PetService {
    return new PetService(this.supabase)
  }

  createMedicalRecordRepository(): MedicalRecordRepository {
    return new MedicalRecordRepository(this.supabase)
  }

  createHospitalizationRepository(): HospitalizationRepository {
    return new HospitalizationRepository(this.supabase)
  }

  createLabRepository(): LabRepository {
    return new LabRepository(this.supabase)
  }

  createVaccineService(): VaccineService {
    return new VaccineService(this.supabase)
  }

  createClinicalToolsService(): ClinicalToolsService {
    return new ClinicalToolsService(this.supabase)
  }

  createSafetyService(): SafetyService {
    return new SafetyService(this.supabase)
  }
}

let globalFactory: DomainFactory | null = null

export function getDomainFactory(supabase?: SupabaseClient): DomainFactory {
  if (!globalFactory) {
    if (!supabase) {
      throw new Error('Supabase client required for first domain factory creation')
    }
    globalFactory = new DomainFactory(supabase)
  }
  return globalFactory
}
