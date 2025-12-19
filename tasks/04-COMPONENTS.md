# Components Refactoring Tasks

> **Priority:** HIGH
> **Total Tasks:** 50
> **Estimated Effort:** 40-60 hours

---

## CRITICAL: Massive Files (>600 lines)

### CMP-001: Split age-calculator.tsx
**File:** `web/components/tools/age-calculator.tsx`
**Lines:** 1,397
**Problem:** Configuration tables + complex logic + 15 state vars

**Split into:**

1. **`web/components/tools/age-calculator/configs.ts`** (~400 lines)
```typescript
// Species configuration data
export const SPECIES_CONFIGS = {
  dog: {
    name: 'Perro',
    icon: Dog,
    lifeExpectancy: { min: 10, max: 16 },
    ageMultipliers: [...],
    breedCategories: [...]
  },
  cat: { ... },
  // ... other species
}

export const AGE_STAGE_DEFINITIONS = { ... }
export const HEALTH_RECOMMENDATIONS = { ... }
```

2. **`web/components/tools/age-calculator/useAgeCalculation.ts`** (~150 lines)
```typescript
export function useAgeCalculation(species: Species, breed: string, birthDate: Date) {
  const [humanAge, setHumanAge] = useState<number | null>(null)
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [healthTips, setHealthTips] = useState<string[]>([])

  useEffect(() => {
    // Calculation logic extracted from component
  }, [species, breed, birthDate])

  return { humanAge, lifeStage, healthTips, isCalculating }
}
```

3. **`web/components/tools/age-calculator/SpeciesSelector.tsx`** (~100 lines)
4. **`web/components/tools/age-calculator/BreedSelector.tsx`** (~80 lines)
5. **`web/components/tools/age-calculator/ResultDisplay.tsx`** (~150 lines)
6. **`web/components/tools/age-calculator/HealthRecommendations.tsx`** (~100 lines)
7. **`web/components/tools/age-calculator/index.tsx`** (~150 lines) - Main orchestrator

**Effort:** 4 hours

---

### CMP-002: Split main-nav.tsx
**File:** `web/components/layout/main-nav.tsx`
**Lines:** 603
**Problem:** Auth + navigation + tools menu + mobile menu + focus trap

**Split into:**

1. **`web/components/layout/nav/ToolsDropdown.tsx`** (~100 lines)
```typescript
interface ToolsDropdownProps {
  clinic: string
  isOpen: boolean
  onClose: () => void
}

export function ToolsDropdown({ clinic, isOpen, onClose }: ToolsDropdownProps) {
  const tools = [
    { name: 'Calculadora de Edad', href: `/${clinic}/tools/age-calculator`, icon: Calculator },
    { name: 'Alimentos Tóxicos', href: `/${clinic}/tools/toxic-food`, icon: AlertTriangle },
    // ...
  ]
  // ...
}
```

2. **`web/components/layout/nav/MobileMenu.tsx`** (~150 lines)
3. **`web/components/layout/nav/UserMenu.tsx`** (~80 lines)
4. **`web/components/layout/nav/useNavAuth.ts`** (~60 lines)
5. **`web/components/layout/main-nav.tsx`** (~200 lines) - Simplified orchestrator

**Effort:** 2.5 hours

---

### CMP-003: Split command-palette.tsx
**File:** `web/components/ui/command-palette.tsx`
**Lines:** 601
**Problem:** Search logic + command building + filtering + keyboard handling

**Split into:**

1. **`web/components/ui/command-palette/useCommandSearch.ts`** (~100 lines)
2. **`web/components/ui/command-palette/CommandList.tsx`** (~120 lines)
3. **`web/components/ui/command-palette/CommandItem.tsx`** (~60 lines)
4. **`web/components/ui/command-palette/useKeyboardNavigation.ts`** (~80 lines)
5. **`web/components/ui/command-palette/index.tsx`** (~150 lines)

**Effort:** 2.5 hours

---

### CMP-004: Split bulk-messaging.tsx
**File:** `web/components/dashboard/bulk-messaging.tsx`
**Lines:** 543
**Problem:** Filter options + client selection + message composition + sending

**Split into:**

1. **`web/components/dashboard/messaging/ClientFilter.tsx`** (~80 lines)
2. **`web/components/dashboard/messaging/TemplateSelector.tsx`** (~60 lines)
3. **`web/components/dashboard/messaging/MessageComposer.tsx`** (~150 lines)
4. **`web/components/dashboard/messaging/useBulkMessaging.ts`** (~80 lines)
5. **`web/components/dashboard/messaging/SendProgress.tsx`** (~60 lines)
6. **`web/components/dashboard/bulk-messaging.tsx`** (~150 lines)

**Effort:** 2 hours

---

### CMP-005: Split network-map.tsx
**File:** `web/components/landing/network-map.tsx`
**Lines:** 541
**Problem:** Complex visualization + animation + interactivity

**Split into:**

1. **`web/components/landing/network-map/MapNode.tsx`** (~80 lines)
2. **`web/components/landing/network-map/MapEdge.tsx`** (~60 lines)
3. **`web/components/landing/network-map/useNetworkAnimation.ts`** (~100 lines)
4. **`web/components/landing/network-map/useMapInteraction.ts`** (~80 lines)
5. **`web/components/landing/network-map/index.tsx`** (~200 lines)

**Effort:** 2 hours

---

## HIGH: Duplicate Components

### CMP-006: Consolidate Appointment Forms
**Files:**
- `web/components/forms/appointment-form.tsx` (170 lines) - Contact form
- `web/components/dashboard/appointment-form.tsx` (417 lines) - Staff form

**Problem:** 70% code overlap, same purpose, different contexts

**Solution A:** Merge with mode prop
```typescript
interface AppointmentFormProps {
  mode: 'contact' | 'staff'
  clinic: string
  onSuccess?: (appointment: Appointment) => void
}

export function AppointmentForm({ mode, clinic, onSuccess }: AppointmentFormProps) {
  // Shared validation, state, submission logic
  // Conditional rendering based on mode
}
```

**Solution B (Recommended):** Extract shared logic to hook
```typescript
// web/hooks/useAppointmentForm.ts
export function useAppointmentForm(clinic: string) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const { data: services } = useServices(clinic)
  const { data: availableSlots } = useAvailableSlots(clinic, selectedService, selectedDate)

  const handleSubmit = async (data: AppointmentData) => {
    // Shared submission logic
  }

  return {
    services,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    availableSlots,
    handleSubmit,
    isSubmitting
  }
}
```

Then keep separate UI components that use the hook.

**Effort:** 2 hours

---

### CMP-007: Consolidate Filter Components
**Files:**
- `web/components/store/filters/filter-sidebar.tsx` (365 lines)
- `web/components/store/filters/filter-drawer.tsx` (363 lines)

**Problem:** 95% identical logic, different layout

**Solution:**
```typescript
// web/components/store/filters/useProductFilters.ts
export function useProductFilters(clinic: string) {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({})

  const SPECIES_ICONS = { ... }  // Shared constant

  const handleSpeciesChange = (species: string[]) => { ... }
  const handlePriceChange = (min: number, max: number) => { ... }
  const handleCategoryChange = (category: string) => { ... }
  const clearFilters = () => { ... }
  const applyFilters = () => { ... }

  return {
    filters,
    appliedFilters,
    SPECIES_ICONS,
    handleSpeciesChange,
    handlePriceChange,
    handleCategoryChange,
    clearFilters,
    applyFilters,
    hasActiveFilters: Object.keys(appliedFilters).length > 0
  }
}
```

```typescript
// web/components/store/filters/FilterContent.tsx
// Shared filter UI (checkboxes, sliders, etc.)

// web/components/store/filters/filter-sidebar.tsx (~100 lines)
// Just wraps FilterContent in sidebar layout

// web/components/store/filters/filter-drawer.tsx (~100 lines)
// Just wraps FilterContent in drawer layout
```

**Effort:** 1.5 hours

---

### CMP-008: Remove Duplicate Command Palette
**Files:**
- `web/components/ui/command-palette.tsx` (601 lines)
- `web/components/search/command-palette.tsx` (393 lines)

**Action:**
1. Compare features of both
2. Keep the more complete one (likely ui/)
3. Update imports in consumers
4. Delete the other

**Effort:** 1 hour

---

### CMP-009: Consolidate Search Components
**Files:**
- `web/components/clinical/diagnosis-search.tsx`
- `web/components/clinical/drug-search.tsx`
- `web/components/dashboard/global-search.tsx` (364 lines)
- `web/components/store/search-autocomplete.tsx` (414 lines)
- `web/components/hospital/admission-form/pet-search-step.tsx`
- `web/components/tools/toxic-food-search.tsx` (466 lines)

**Problem:** 6 similar implementations

**Solution:** Create generic SearchField component
```typescript
interface SearchFieldProps<T> {
  placeholder: string
  onSearch: (query: string) => Promise<T[]>
  renderItem: (item: T) => React.ReactNode
  onSelect: (item: T) => void
  debounceMs?: number
  minChars?: number
}

export function SearchField<T>({
  placeholder,
  onSearch,
  renderItem,
  onSelect,
  debounceMs = 300,
  minChars = 2
}: SearchFieldProps<T>) {
  // Generic search implementation
}
```

**Usage:**
```typescript
<SearchField<Drug>
  placeholder="Buscar medicamento..."
  onSearch={(q) => searchDrugs(q, clinic)}
  renderItem={(drug) => <DrugItem drug={drug} />}
  onSelect={(drug) => setSelectedDrug(drug)}
/>
```

**Effort:** 3 hours

---

## HIGH: Missing Abstractions

### CMP-010: Create FormModal Component
**Problem:** 10+ modal implementations with forms

**Files affected:**
- `appointments/reschedule-dialog.tsx`
- `calendar/event-detail-modal.tsx`
- `calendar/quick-add-modal.tsx`
- `consents/blanket-consents/add-consent-modal.tsx`
- `dashboard/keyboard-shortcuts-modal.tsx`
- `invoices/record-payment-dialog.tsx`
- `invoices/send-invoice-dialog.tsx`
- `messaging/new-conversation-dialog.tsx`
- `services/add-service-modal.tsx`
- `store/quick-view-modal.tsx`

**Create:**
```typescript
// web/components/ui/form-modal.tsx
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: () => Promise<void>
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  size = 'md'
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Effort:** 2 hours

---

### CMP-011: Create DataTable Component
**Problem:** Multiple list/table implementations

**Files affected:**
- `appointments/appointment-list.tsx`
- `dashboard/appointments/appointment-queue.tsx`
- `dashboard/client-notes.tsx`
- `dashboard/pets-by-owner.tsx`
- `dashboard/upcoming-vaccines.tsx`

**Create:**
```typescript
// web/components/ui/data-table.tsx
interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  isLoading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
}

export function DataTable<T>({ ... }: DataTableProps<T>) {
  // Reusable table implementation
}
```

**Effort:** 3 hours

---

### CMP-012: Create FilterChips Component
**Problem:** Filter display duplicated across many components

**Create:**
```typescript
interface FilterChip {
  key: string
  label: string
  value: string
  onRemove: () => void
}

interface FilterChipsProps {
  filters: FilterChip[]
  onClearAll?: () => void
}

export function FilterChips({ filters, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Badge key={filter.key} variant="secondary" className="gap-1">
          {filter.label}: {filter.value}
          <button onClick={filter.onRemove}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Limpiar todo
        </Button>
      )}
    </div>
  )
}
```

**Effort:** 1 hour

---

## MEDIUM: Large Components (400-600 lines)

### CMP-013 through CMP-025: Split Medium Components

| Task | File | Lines | Action | Effort |
|------|------|-------|--------|--------|
| CMP-013 | `dashboard/waiting-room.tsx` | 518 | Extract WaitingRoomFilters, WaitingRoomList | 1.5h |
| CMP-014 | `dashboard/pets-by-owner.tsx` | 464 | Extract OwnerSelector, usePetsFilter | 1.5h |
| CMP-015 | `tools/toxic-food-search.tsx` | 466 | Extract using generic SearchField | 1h |
| CMP-016 | `landing/pricing-quiz.tsx` | 538 | Extract usePricingQuiz, QuestionDisplay | 2h |
| CMP-017 | `landing/pricing-section.tsx` | 482 | Extract PlanCard, FeatureList | 1.5h |
| CMP-018 | `landing/roi-calculator.tsx` | 433 | Extract useROICalculation, ResultsChart | 1.5h |
| CMP-019 | `dashboard/pet-quick-add-form.tsx` | 442 | Extract FileUploadSection | 1h |
| CMP-020 | `onboarding/onboarding-wizard.tsx` | 443 | Extract wizard steps to separate files | 2h |
| CMP-021 | `lab/order-form.tsx` | 458 | Extract PanelSelector, TestSelector | 1.5h |
| CMP-022 | `lab/result-viewer.tsx` | 428 | Extract ResultInterpretation | 1h |
| CMP-023 | `lab/result-entry.tsx` | 418 | Extract ResultInput | 1h |
| CMP-024 | `hospital/hospital-dashboard.tsx` | 417 | Extract dashboard sections | 1.5h |
| CMP-025 | `store/quick-view-modal.tsx` | 418 | Extract ProductTabs, ReviewSection | 1.5h |

---

## MEDIUM: Naming Convention Fixes

### CMP-026: Rename PascalCase Files to kebab-case
**Files to rename:**
```
booking/booking-wizard/BookingSummary.tsx -> booking-summary.tsx
booking/booking-wizard/Confirmation.tsx -> confirmation.tsx
booking/booking-wizard/DateTimeSelection.tsx -> date-time-selection.tsx
booking/booking-wizard/PetSelection.tsx -> pet-selection.tsx
booking/booking-wizard/ServiceSelection.tsx -> service-selection.tsx
booking/booking-wizard/SuccessScreen.tsx -> success-screen.tsx
faq/FAQSection.tsx -> faq-section.tsx
ui/Toast.tsx -> toast.tsx
```

**Effort:** 1 hour (includes updating imports)

---

### CMP-027: Standardize Component Suffix Naming
**Current inconsistency:**
- `-button`: cancel-button, logout-button, export-csv-button
- `-actions`: patient-quick-actions, quick-actions-handler
- `-modal`: event-detail-modal, add-consent-modal
- `-dialog`: reschedule-dialog, record-payment-dialog

**Standard:**
- Use `-button` for single action buttons
- Use `-actions` for multi-action groups
- Use `-modal` for all modals (not dialog)

**Files to rename:**
```
appointments/reschedule-dialog.tsx -> reschedule-modal.tsx
invoices/record-payment-dialog.tsx -> record-payment-modal.tsx
invoices/send-invoice-dialog.tsx -> send-invoice-modal.tsx
messaging/new-conversation-dialog.tsx -> new-conversation-modal.tsx
```

**Effort:** 30 minutes

---

## MEDIUM: Props Interface Fixes

### CMP-028: Rename Generic Props Interfaces
**Files using generic `Props` instead of `[Component]Props`:**

Find and replace pattern:
```typescript
// Before
interface Props {
  clinic: string
  onSubmit: () => void
}

// After
interface BulkMessagingProps {
  clinic: string
  onSubmit: () => void
}
```

**Effort:** 1 hour

---

## LOW: Directory Organization

### CMP-029: Reorganize Dashboard Components
**Current:** 16 files in single directory

**Proposed:**
```
components/dashboard/
  appointments/
    appointment-form.tsx
    appointment-queue.tsx
    status-buttons.tsx
  clients/
    client-notes.tsx
    client-tags.tsx
    client-invite-form.tsx
  inventory/
    barcode-scanner.tsx
    export-csv-button.tsx
  messaging/
    bulk-messaging.tsx
  index.ts
```

**Effort:** 2 hours

---

### CMP-030: Create Hooks Directory
**Extract hooks from components:**
```
components/hooks/
  useAppointmentForm.ts
  useProductFilters.ts
  useBulkMessaging.ts
  useAgeCalculation.ts
  useCommandSearch.ts
  index.ts
```

**Effort:** 1 hour

---

## LOW: UI Library Improvements

### CMP-031: Extract Business Logic from ui/command-palette.tsx
**Problem:** UI component contains business logic

Move to `components/search/` or `components/dashboard/`

**Effort:** 1 hour

---

### CMP-032: Split mobile-utils.tsx
**File:** `web/components/ui/mobile-utils.tsx`
**Lines:** 509
**Problem:** Multiple utilities in one file

**Split into:**
- `ui/swipeable-card.tsx`
- `ui/touch-targets.ts`
- `ui/mobile-utils/index.ts`

**Effort:** 1 hour

---

### CMP-033: Extract structured-data.tsx Data
**File:** `web/components/seo/structured-data.tsx`
**Lines:** 347
**Problem:** 400+ lines of JSON schema data inline

**Move to:**
```typescript
// web/lib/seo/schemas.ts
export const ORGANIZATION_SCHEMA = { ... }
export const VETERINARY_SCHEMA = { ... }
export const LOCAL_BUSINESS_SCHEMA = { ... }
```

**Effort:** 45 minutes

---

## Checklist Summary

```
CRITICAL (Split >600 lines):
[ ] CMP-001: age-calculator.tsx (1,397 lines)
[ ] CMP-002: main-nav.tsx (603 lines)
[ ] CMP-003: command-palette.tsx (601 lines)
[ ] CMP-004: bulk-messaging.tsx (543 lines)
[ ] CMP-005: network-map.tsx (541 lines)

HIGH (Consolidate Duplicates):
[ ] CMP-006: Appointment forms
[ ] CMP-007: Filter components
[ ] CMP-008: Command palettes
[ ] CMP-009: Search components

HIGH (Create Abstractions):
[ ] CMP-010: FormModal
[ ] CMP-011: DataTable
[ ] CMP-012: FilterChips

MEDIUM (Split 400-600 lines):
[ ] CMP-013 to CMP-025: 13 components

MEDIUM (Naming):
[ ] CMP-026: PascalCase files
[ ] CMP-027: Suffix standardization
[ ] CMP-028: Props interfaces

LOW (Organization):
[ ] CMP-029: Dashboard reorganization
[ ] CMP-030: Hooks directory
[ ] CMP-031: UI business logic
[ ] CMP-032: mobile-utils split
[ ] CMP-033: structured-data extraction
```
