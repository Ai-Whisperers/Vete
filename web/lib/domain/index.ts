/**
 * Domain layer
 * Organized into core platform domains and vertical-specific domains.
 *
 * CORE: Generic business logic used by ALL tenants (scheduling, billing, store, etc.)
 * VERTICALS: Industry-specific logic (clinic, retail, services, etc.)
 */

// ===========================================================================
// FACTORY
// ===========================================================================

export { DomainFactory, getDomainFactory } from './factory'

// ===========================================================================
// CORE DOMAINS — Used by ALL tenants regardless of vertical
// ===========================================================================

export * from './core/appointments'
export * from './core/invoices'
export * from './core/payments'
export * from './core/users'

export { InventoryRepository, InventoryService, createInventoryService } from './core/inventory'
export type {
  TransactionType,
  Inventory,
  InventoryTransaction,
  InventoryWithProduct,
  CreateInventoryData,
  UpdateInventoryData,
  StockAdjustmentData,
  InventoryData,
  InventoryFilters,
  TransactionFilters,
  InventoryStats,
  LowStockItem,
  ExpiryItem,
  StockValuation,
  TransactionSummary,
} from './core/inventory'

export { ConsentRepository, ConsentService, createConsentService } from './core/consent'
export type {
  ConsentCategory,
  ConsentPreferenceType,
  ConsentSource,
  ConsentDocumentStatus,
  ConsentAuditAction,
  ConsentTemplate,
  ConsentTemplateVersion,
  ConsentDocument,
  ConsentPreference,
  ConsentPreferenceAudit,
  ConsentAuditLog,
  CreateTemplateData,
  UpdateTemplateData,
  CreateDocumentData,
  SignDocumentData,
  RevokeDocumentData,
  UpdatePreferenceData,
  TemplateFilters,
  DocumentFilters,
  ConsentAnalytics,
} from './core/consent'

export { StoreRepository, StoreService } from './core/store'
export type {
  OrderStatus,
  CartItemType,
  Product,
  ProductWithStock,
  CartItem,
  Cart,
  Order,
  OrderWithItems,
  CartItemJsonb,
  ProductRow,
  CheckoutInput,
  AddToCartInput,
  UpdateCartItemInput,
  ProductFilters,
  OrderFilters,
  CartSummary,
  OrderStats,
  ProductAnalytics,
} from './core/store'

export * from './core/messaging'
export * from './core/reminders'

// ===========================================================================
// CLINIC VERTICAL — Pet clinics and human medical clinics
// ===========================================================================

export * from './verticals/clinic/pets'
export * from './verticals/clinic/medical-records'
export * from './verticals/clinic/hospitalizations'
export * from './verticals/clinic/lab'
export * from './verticals/clinic/vaccines'
export * from './verticals/clinic/clinical-tools'
export * from './verticals/clinic/safety'
