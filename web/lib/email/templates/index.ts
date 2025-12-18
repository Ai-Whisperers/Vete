/**
 * Email Templates Index
 *
 * Exports all email templates for easy importing
 */

export {
  generateInvoiceEmail,
  generateInvoiceEmailText,
  type InvoiceEmailData,
} from './invoice-email'

export {
  generateConsentRequestEmail,
  generateConsentRequestEmailText,
  type ConsentRequestEmailData,
} from './consent-request'

export {
  generateAppointmentReminderEmail,
  generateAppointmentReminderEmailText,
  type AppointmentReminderEmailData,
} from './appointment-reminder'
