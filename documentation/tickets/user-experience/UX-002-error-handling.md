# UX-002: User-Friendly Error Handling

## Priority: P2
## Category: User Experience
## Status: Not Started
## Epic: [EPIC-16: User Experience](../epics/EPIC-16-user-experience.md)

## Description
Implement consistent, user-friendly error handling across the application with helpful messages, recovery actions, and offline support.

## Current State
- Generic error messages
- Inconsistent error display
- No offline handling
- Limited error recovery options

## Proposed Solution

### Error Boundary Component
```tsx
// components/error/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Report to monitoring
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Error Fallback UI
```tsx
// components/error/error-fallback.tsx
interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const errorType = classifyError(error);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {errorMessages[errorType].title}
      </h2>

      <p className="text-gray-600 mb-6 max-w-md">
        {errorMessages[errorType].description}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-8 text-left text-sm">
          <summary className="cursor-pointer text-gray-500">
            Detalles del error
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

const errorMessages = {
  network: {
    title: 'Error de conexión',
    description: 'No pudimos conectarnos al servidor. Verifica tu conexión a internet e intenta de nuevo.',
  },
  server: {
    title: 'Error del servidor',
    description: 'Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo.',
  },
  validation: {
    title: 'Datos inválidos',
    description: 'Algunos datos ingresados no son válidos. Por favor revisa el formulario.',
  },
  notFound: {
    title: 'No encontrado',
    description: 'El recurso que buscas no existe o fue eliminado.',
  },
  unauthorized: {
    title: 'Acceso denegado',
    description: 'No tienes permiso para acceder a este recurso. Inicia sesión para continuar.',
  },
  unknown: {
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  },
};
```

### Toast Notifications
```tsx
// components/ui/toast.tsx
import { toast, Toaster } from 'sonner';

export { Toaster };

export const showToast = {
  success: (message: string) => toast.success(message, {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    duration: 3000,
  }),

  error: (message: string, action?: { label: string; onClick: () => void }) =>
    toast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      duration: 5000,
      action: action && {
        label: action.label,
        onClick: action.onClick,
      },
    }),

  loading: (message: string) => toast.loading(message),

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),
};

// Usage example
showToast.promise(
  saveAppointment(data),
  {
    loading: 'Guardando cita...',
    success: '¡Cita guardada exitosamente!',
    error: 'Error al guardar la cita',
  }
);
```

### Offline Support
```tsx
// components/offline/offline-banner.tsx
'use client';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-3 px-4 flex items-center justify-center gap-2 z-50">
      <WifiOff className="w-5 h-5" />
      <span className="font-medium">Sin conexión a internet</span>
      <span className="text-sm">Algunas funciones no están disponibles</span>
    </div>
  );
}
```

### Form Error Display
```tsx
// components/forms/form-error.tsx
interface FormErrorProps {
  errors: Record<string, string[]>;
}

export function FormErrors({ errors }: FormErrorProps) {
  const errorList = Object.entries(errors).flatMap(([field, messages]) =>
    messages.map(msg => ({ field, message: msg }))
  );

  if (errorList.length === 0) return null;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800">
            {errorList.length === 1
              ? 'Hay un error en el formulario'
              : `Hay ${errorList.length} errores en el formulario`}
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {errorList.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Implementation Steps
1. Create error classification system
2. Implement error boundary component
3. Create error fallback UI
4. Add toast notification system
5. Implement offline detection
6. Update all forms with proper error display
7. Add error monitoring integration

## Acceptance Criteria
- [ ] Error boundaries on all pages
- [ ] User-friendly error messages
- [ ] Toast notifications system
- [ ] Offline state detection
- [ ] Form errors clearly displayed
- [ ] Error recovery actions

## Error Message Guidelines
- Use simple, non-technical language
- Explain what happened
- Suggest what user can do
- Provide recovery action when possible
- Avoid blame ("You did something wrong")

## Related Files
- `components/error/` - Error components
- `components/ui/toast.tsx` - Toast notifications
- `lib/errors/` - Error utilities

## Estimated Effort
- 10 hours
  - Error boundary: 2h
  - Error fallback UI: 2h
  - Toast system: 2h
  - Offline support: 2h
  - Form integration: 2h
