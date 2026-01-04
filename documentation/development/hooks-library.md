# Custom React Hooks Library

Reusable hooks for common patterns in the Vete platform.

> **Location**: `web/lib/hooks/`
> **Last Updated**: January 2026

---

## Overview

The hooks library provides type-safe, tested hooks that replace common patterns throughout the application:

| Hook | Purpose | Replaces |
|------|---------|----------|
| `useAsyncData` | Data fetching with loading/error states | Manual `useEffect` + `useState` |
| `useFormState` | Form management with Zod validation | Manual form state tracking |
| `useModal` | Modal open/close state | Boolean state + handlers |
| `useSyncedState` | localStorage + API synchronization | Manual sync logic |
| `useConfirmation` | Promise-based confirmation dialogs | Callback-based confirms |
| `useLocalStorage` | Simple localStorage persistence | Manual localStorage access |

---

## Installation

All hooks are exported from the barrel file:

```typescript
import {
  useAsyncData,
  useFormState,
  useModal,
  useModalWithData,
  useConfirmation,
  useSyncedState,
  useLocalStorage,
} from '@/lib/hooks'
```

---

## useAsyncData

Hook for managing async data fetching with loading, error, and refetch states.

### API

```typescript
function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps?: React.DependencyList,
  options?: UseAsyncDataOptions
): AsyncDataResult<T>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether to fetch immediately on mount |
| `onSuccess` | `(data: T) => void` | - | Called when fetch succeeds |
| `onError` | `(error: Error) => void` | - | Called when fetch fails |
| `refetchInterval` | `number` | - | Auto-refetch interval in ms |
| `keepPreviousData` | `boolean` | `false` | Keep previous data while refetching |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| undefined` | Fetched data |
| `status` | `'idle' \| 'loading' \| 'success' \| 'error'` | Current status |
| `isLoading` | `boolean` | Whether currently loading |
| `isSuccess` | `boolean` | Whether fetch succeeded |
| `isError` | `boolean` | Whether fetch failed |
| `error` | `Error \| undefined` | Error object if failed |
| `refetch` | `() => Promise<void>` | Manually trigger refetch |
| `reset` | `() => void` | Reset to initial state |

### Example

```typescript
function PetList({ tenantId }: { tenantId: string }) {
  const { data: pets, isLoading, error, refetch } = useAsyncData(
    () => fetch(`/api/pets?tenant=${tenantId}`).then(r => r.json()),
    [tenantId],
    {
      enabled: !!tenantId,
      refetchInterval: 30000,
      onSuccess: (pets) => console.log(`Loaded ${pets.length} pets`),
    }
  )

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!pets) return null

  return (
    <ul>
      {pets.map(pet => <li key={pet.id}>{pet.name}</li>)}
    </ul>
  )
}
```

### Simpler Alternative

For simple cases, use `useSimpleAsyncData`:

```typescript
const [pets, isLoading, error] = useSimpleAsyncData(
  () => fetchPets(),
  [tenantId]
)
```

---

## useFormState

Hook for managing form state with validation, submission, and error handling.

### API

```typescript
function useFormState<T extends Record<string, unknown>>(
  options: UseFormStateOptions<T>
): FormStateResult<T>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialValues` | `T` | Required | Initial form values |
| `schema` | `ZodSchema<T>` | - | Zod schema for validation |
| `onSubmit` | `(values: T) => Promise<void>` | Required | Submit handler |
| `onError` | `(errors) => void` | - | Called on validation/submission error |
| `onSuccess` | `() => void` | - | Called on successful submission |
| `validateOnBlur` | `boolean` | `true` | Validate field on blur |
| `validateOnChange` | `boolean` | `false` | Validate field on change |
| `resetOnSuccess` | `boolean` | `false` | Reset form after success |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `values` | `T` | Current form values |
| `errors` | `FieldErrors<T>` | Field-level errors |
| `formError` | `string \| undefined` | General form error |
| `status` | `FormStatus` | `'idle' \| 'submitting' \| 'success' \| 'error'` |
| `isSubmitting` | `boolean` | Whether form is submitting |
| `isDirty` | `boolean` | Whether form has changes |
| `isValid` | `boolean` | Whether form passed validation |
| `setValue` | `(field, value) => void` | Update a single field |
| `setValues` | `(values) => void` | Update multiple fields |
| `reset` | `() => void` | Reset to initial values |
| `validate` | `() => boolean` | Validate without submitting |
| `handleSubmit` | `(e: FormEvent) => void` | Form submit handler |
| `getFieldProps` | `(field) => props` | Get props for input element |
| `getCheckboxProps` | `(field) => props` | Get props for checkbox |

### Example

```typescript
import { z } from 'zod'

const petSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  species: z.enum(['dog', 'cat']),
  weight: z.number().positive('Peso debe ser positivo'),
})

function PetForm() {
  const form = useFormState({
    initialValues: { name: '', species: 'dog' as const, weight: 0 },
    schema: petSchema,
    onSubmit: async (values) => {
      await fetch('/api/pets', {
        method: 'POST',
        body: JSON.stringify(values),
      })
    },
    onSuccess: () => toast.success('Mascota creada'),
    resetOnSuccess: true,
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <label>Nombre</label>
        <input {...form.getFieldProps('name')} />
        {form.errors.name && <span className="error">{form.errors.name}</span>}
      </div>

      <div>
        <label>Especie</label>
        <select {...form.getFieldProps('species')}>
          <option value="dog">Perro</option>
          <option value="cat">Gato</option>
        </select>
      </div>

      <div>
        <label>Peso (kg)</label>
        <input type="number" {...form.getFieldProps('weight')} />
        {form.errors.weight && <span className="error">{form.errors.weight}</span>}
      </div>

      {form.formError && <div className="form-error">{form.formError}</div>}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

---

## useModal

Hook for managing modal/dialog open/close state.

### API

```typescript
function useModal(options?: UseModalOptions): ModalState
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpen` | `() => void` | - | Called when modal opens |
| `onClose` | `() => void` | - | Called when modal closes |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Whether modal is open |
| `open` | `() => void` | Open the modal |
| `close` | `() => void` | Close the modal |
| `toggle` | `() => void` | Toggle open/close |
| `modalProps` | `{ isOpen, onClose }` | Props to spread on modal |

### Example

```typescript
function PetActions({ pet }: { pet: Pet }) {
  const editModal = useModal({
    onClose: () => console.log('Edit modal closed'),
  })

  return (
    <>
      <button onClick={editModal.open}>Editar</button>

      <Modal {...editModal.modalProps}>
        <h2>Editar {pet.name}</h2>
        <PetEditForm pet={pet} onSuccess={editModal.close} />
      </Modal>
    </>
  )
}
```

---

## useModalWithData

Extended modal hook that carries associated data (e.g., item being edited).

### API

```typescript
function useModalWithData<T>(options?: UseModalOptions): ModalWithDataState<T>
```

### Additional Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| undefined` | Associated data |
| `open` | `(data: T) => void` | Open with data |
| `openEmpty` | `() => void` | Open without data |

### Example

```typescript
interface Pet { id: string; name: string }

function PetList({ pets }: { pets: Pet[] }) {
  const editModal = useModalWithData<Pet>()
  const deleteModal = useModalWithData<Pet>()

  return (
    <>
      {pets.map(pet => (
        <div key={pet.id}>
          <span>{pet.name}</span>
          <button onClick={() => editModal.open(pet)}>Editar</button>
          <button onClick={() => deleteModal.open(pet)}>Eliminar</button>
        </div>
      ))}

      <EditModal {...editModal.modalProps} pet={editModal.data} />
      <DeleteConfirmModal {...deleteModal.modalProps} pet={deleteModal.data} />
    </>
  )
}
```

---

## useConfirmation

Hook for promise-based confirmation dialogs.

### API

```typescript
function useConfirmation(): ConfirmationState
```

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Whether dialog is open |
| `message` | `string` | Confirmation message |
| `ask` | `(message: string) => Promise<boolean>` | Ask for confirmation |
| `onConfirm` | `() => void` | Confirm handler |
| `onCancel` | `() => void` | Cancel handler |

### Example

```typescript
function DeleteButton({ petId }: { petId: string }) {
  const confirm = useConfirmation()

  const handleDelete = async () => {
    const confirmed = await confirm.ask('¿Estás seguro de eliminar esta mascota?')
    if (confirmed) {
      await fetch(`/api/pets/${petId}`, { method: 'DELETE' })
      toast.success('Mascota eliminada')
    }
  }

  return (
    <>
      <button onClick={handleDelete} className="text-red-600">
        Eliminar
      </button>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
    </>
  )
}
```

---

## useSyncedState

Hook for state that syncs between localStorage and a remote API.

### API

```typescript
function useSyncedState<T>(options: UseSyncedStateOptions<T>): SyncedStateResult<T>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storageKey` | `string` | - | localStorage key for persistence |
| `initialState` | `T` | Required | Initial/default state |
| `loadFromRemote` | `() => Promise<T>` | - | Load state from API |
| `saveToRemote` | `(state: T) => Promise<void>` | - | Save state to API |
| `debounceMs` | `number` | `500` | Debounce delay for auto-sync |
| `autoSync` | `boolean` | `true` if saveToRemote | Auto-sync on change |
| `isAuthenticated` | `boolean` | `true` | Enable/disable remote sync |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `state` | `T` | Current local state |
| `setState` | `(value) => void` | Update state |
| `syncStatus` | `SyncStatus` | `'idle' \| 'syncing' \| 'synced' \| 'error'` |
| `isSyncing` | `boolean` | Whether syncing |
| `syncError` | `Error \| undefined` | Last sync error |
| `sync` | `() => Promise<void>` | Force sync to remote |
| `reload` | `() => Promise<void>` | Reload from remote |
| `hasUnsavedChanges` | `boolean` | Pending changes |

### Example: Cart Context

```typescript
interface CartItem { productId: string; quantity: number }

function CartProvider({ children }: { children: ReactNode }) {
  const user = useUser()

  const {
    state: items,
    setState: setItems,
    isSyncing,
    hasUnsavedChanges,
  } = useSyncedState<CartItem[]>({
    storageKey: 'cart',
    initialState: [],
    loadFromRemote: async () => {
      const res = await fetch('/api/store/cart')
      const data = await res.json()
      return data.items || []
    },
    saveToRemote: async (items) => {
      await fetch('/api/store/cart', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      })
    },
    debounceMs: 500,
    isAuthenticated: !!user,
  })

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  return (
    <CartContext.Provider value={{ items, addItem, isSyncing }}>
      {children}
    </CartContext.Provider>
  )
}
```

---

## useLocalStorage

Simple localStorage persistence without remote sync.

### API

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

### Example

```typescript
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

---

## TypeScript Types

All types are exported for use in your components:

```typescript
import type {
  // useAsyncData
  AsyncDataResult,
  AsyncDataStatus,
  UseAsyncDataOptions,

  // useFormState
  FormStateResult,
  FieldErrors,
  FormStatus,
  UseFormStateOptions,

  // useModal
  ModalState,
  ModalWithDataState,
  ConfirmationState,
  UseModalOptions,

  // useSyncedState
  SyncedStateResult,
  SyncStatus,
  UseSyncedStateOptions,
} from '@/lib/hooks'
```

---

## Best Practices

### 1. Use dependencies correctly

```typescript
// Good - tenantId in deps
const { data } = useAsyncData(
  () => fetchPets(tenantId),
  [tenantId]
)

// Bad - missing dependency
const { data } = useAsyncData(
  () => fetchPets(tenantId),
  [] // Won't refetch when tenantId changes
)
```

### 2. Handle loading and error states

```typescript
function Component() {
  const { data, isLoading, error } = useAsyncData(fetcher, [])

  if (isLoading) return <Spinner />
  if (error) return <ErrorBoundary error={error} />
  if (!data) return null

  return <Content data={data} />
}
```

### 3. Use conditional fetching

```typescript
// Only fetch when we have a valid ID
const { data } = useAsyncData(
  () => fetchPet(petId),
  [petId],
  { enabled: !!petId }
)
```

### 4. Combine hooks for complex flows

```typescript
function EditPetModal({ petId }: { petId: string }) {
  const modal = useModal()
  const { data: pet, isLoading } = useAsyncData(
    () => fetchPet(petId),
    [petId],
    { enabled: modal.isOpen }
  )

  const form = useFormState({
    initialValues: pet || { name: '' },
    onSubmit: updatePet,
    onSuccess: modal.close,
  })

  // ...
}
```

---

## Migration Guide

### From manual useEffect + useState

Before:
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  let mounted = true
  setLoading(true)
  fetchData()
    .then(d => mounted && setData(d))
    .catch(e => mounted && setError(e))
    .finally(() => mounted && setLoading(false))
  return () => { mounted = false }
}, [id])
```

After:
```typescript
const { data, isLoading, error } = useAsyncData(
  () => fetchData(),
  [id]
)
```

### From manual form state

Before:
```typescript
const [name, setName] = useState('')
const [errors, setErrors] = useState({})
const [submitting, setSubmitting] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!name) {
    setErrors({ name: 'Required' })
    return
  }
  setSubmitting(true)
  try {
    await save({ name })
  } finally {
    setSubmitting(false)
  }
}
```

After:
```typescript
const form = useFormState({
  initialValues: { name: '' },
  schema: z.object({ name: z.string().min(1, 'Required') }),
  onSubmit: save,
})

// Just use form.handleSubmit, form.getFieldProps('name'), etc.
```
