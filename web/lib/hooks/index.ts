/**
 * Custom React Hooks Library
 *
 * This module exports reusable hooks for common patterns in the application.
 *
 * @example
 * ```typescript
 * import { useAsyncData, useFormState, useModal } from '@/lib/hooks'
 * ```
 */

// Data fetching
export {
  useAsyncData,
  useSimpleAsyncData,
  type AsyncDataResult,
  type AsyncDataStatus,
  type UseAsyncDataOptions,
} from './use-async-data'

// Form handling
export {
  useFormState,
  type FormStateResult,
  type FieldErrors,
  type FormStatus,
  type UseFormStateOptions,
} from './use-form-state'

// Modal management
export {
  useModal,
  useModalWithData,
  useConfirmation,
  type ModalState,
  type ModalWithDataState,
  type ConfirmationState,
  type UseModalOptions,
} from './use-modal'

// State synchronization
export {
  useSyncedState,
  useLocalStorage,
  type SyncedStateResult,
  type SyncStatus,
  type UseSyncedStateOptions,
} from './use-synced-state'

// Dashboard labels
export {
  useDashboardLabels,
  DashboardLabelsProvider,
  defaultDashboardLabels,
} from './use-dashboard-labels'

// Barcode scanning
export { useBarcodeScanner } from './use-barcode-scanner'

// Import wizard state
export {
  useImportWizard,
  type ImportMapping,
  type PreviewResult,
  type ImportResult,
  type UseImportWizardOptions,
  type UseImportWizardReturn,
} from './use-import-wizard'

// Tenant features (tier-based feature gating)
export {
  useTenantFeatures,
  TenantFeaturesProvider,
  FeatureGate,
  RequireFeatures,
  UpgradePrompt,
  TrialBanner,
  type ResolvedTenantFeatures,
  type FeatureGateResult,
} from './use-tenant-features'
