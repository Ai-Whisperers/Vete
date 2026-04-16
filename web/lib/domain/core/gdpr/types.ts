export type GDPRRequestType =
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'portability'
  | 'objection'

export type GDPRRequestStatus =
  | 'pending'
  | 'identity_verification'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export interface GDPRRequest {
  id: string
  userId: string
  tenantId: string
  requestType: GDPRRequestType
  status: GDPRRequestStatus
  requestedAt: string
  processedAt?: string
  completedAt?: string
  rejectionReason?: string
  verificationToken?: string
  verificationExpiresAt?: string
  exportFileUrl?: string
  exportExpiresAt?: string
  notes?: string
  processedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateGDPRRequestInput {
  requestType: GDPRRequestType
  reason?: string
}

export interface UserDataExport {
  exportedAt: string
  format: 'json'
  dataSubject: DataSubjectInfo
  profile: ProfileData | null
  pets: PetData[]
  appointments: AppointmentData[]
  medicalRecords: MedicalRecordData[]
  prescriptions: PrescriptionData[]
  invoices: InvoiceData[]
  payments: PaymentData[]
  messages: MessageData[]
  loyaltyPoints: LoyaltyData | null
  storeOrders: StoreOrderData[]
  storeReviews: StoreReviewData[]
  consents: ConsentData[]
  activityLog: ActivityLogEntry[]
}

export interface DataSubjectInfo {
  userId: string
  email: string
  fullName: string
  tenantId: string
  tenantName: string
  role: string
  accountCreatedAt: string
}

export interface ProfileData {
  id: string
  fullName: string
  email: string
  phone?: string
  address?: string
  preferredLanguage?: string
  notificationPreferences?: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface PetData {
  id: string
  name: string
  species: string
  breed?: string
  dateOfBirth?: string
  gender?: string
  weight?: number
  microchipId?: string
  photoUrl?: string
  isDeceased: boolean
  createdAt: string
  updatedAt: string
}

export interface AppointmentData {
  id: string
  petName: string
  serviceName: string
  scheduledAt: string
  status: string
  notes?: string
  createdAt: string
}

export interface MedicalRecordData {
  id: string
  petName: string
  recordType: string
  date: string
  diagnosis?: string
  treatment?: string
  notes?: string
  createdAt: string
}

export interface PrescriptionData {
  id: string
  petName: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
  start_date: string
  end_date: string
  is_active: boolean
  refills_remaining: number
  createdAt: string
}

export interface InvoiceData {
  id: string
  clientId: string
  petId: string
  invoiceNumber: string
  appointmentId: string
  medicalRecordId: string
  hospitalizationId: string
  subtotal: number
  discountAmount: number
  discountReason: string
  taxRate: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: string
  dueDate: string
  paidAt: string
  sentAt: string
  voidedAt: string
  voided_by: string
  notes: string
  internalNotes: string
  createdAt: string
  updatedAt: string
}

export interface PaymentData {
  id: string
  invoiceId: string
  amount: number
  paymentMethod: string
  paymentReference: string
  status: string
  paidAt: string
  processedBy: string
  notes: string
  createdAt: string
}

export interface MessageData {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  message: string
  createdAt: string
}

export interface LoyaltyData {
  id: string
  userId: string
  points: number
  createdAt: string
}

export interface StoreOrderData {
  id: string
  userId: string
  orderId: string
  orderDate: string
  total: number
  status: string
  createdAt: string
}

export interface StoreReviewData {
  id: string
  userId: string
  review: string
  rating: number
  createdAt: string
}

export interface ConsentData {
  id: string
  userId: string
  consentType: string
  consentDate: string
  createdAt: string
}

export interface ActivityLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface DeletionResult {
  deleted: boolean
  message: string
}