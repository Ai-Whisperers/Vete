# UX-005: User Onboarding Experience

## Priority: P2
## Category: User Experience
## Status: Not Started
## Epic: [EPIC-16: User Experience](../epics/EPIC-16-user-experience.md)

## Description
Create a guided onboarding experience for new users (both pet owners and clinic staff) to help them understand and use the platform effectively.

## Current State
- Users land on portal after signup
- No guided tour or setup wizard
- Features discovered organically
- No progress tracking for setup

## Proposed Solution

### Onboarding Steps Definition
```typescript
// lib/onboarding/steps.ts
export const OWNER_ONBOARDING_STEPS = [
  {
    id: 'complete_profile',
    title: 'Completa tu perfil',
    description: 'Agrega tu información de contacto',
    target: '/portal/profile',
    completed: (user: User) => !!user.phone && !!user.address,
  },
  {
    id: 'add_pet',
    title: 'Registra tu mascota',
    description: 'Agrega la información de tu primera mascota',
    target: '/portal/pets/new',
    completed: (user: User) => user.petsCount > 0,
  },
  {
    id: 'book_appointment',
    title: 'Agenda tu primera cita',
    description: 'Reserva una cita con nuestros veterinarios',
    target: '/book',
    completed: (user: User) => user.appointmentsCount > 0,
  },
  {
    id: 'explore_store',
    title: 'Explora la tienda',
    description: 'Descubre productos para tu mascota',
    target: '/store',
    completed: () => true, // Just needs to visit
    optional: true,
  },
];

export const STAFF_ONBOARDING_STEPS = [
  {
    id: 'view_schedule',
    title: 'Revisa tu agenda',
    description: 'Familiarízate con el calendario de citas',
    target: '/dashboard/calendar',
  },
  {
    id: 'manage_patient',
    title: 'Gestiona un paciente',
    description: 'Aprende a ver y editar registros médicos',
    target: '/dashboard/patients',
  },
  {
    id: 'create_prescription',
    title: 'Crea una receta',
    description: 'Genera tu primera prescripción digital',
    target: '/dashboard/prescriptions/new',
  },
  {
    id: 'use_calculator',
    title: 'Usa la calculadora de dosis',
    description: 'Calcula dosis para un paciente',
    target: '/tools/dosage-calculator',
  },
];
```

### Onboarding Progress Component
```tsx
// components/onboarding/progress-bar.tsx
export function OnboardingProgress() {
  const { steps, completedCount, totalCount, currentStep } = useOnboarding();
  const percentage = Math.round((completedCount / totalCount) * 100);

  if (completedCount === totalCount) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-primary">Configura tu cuenta</h3>
          <p className="text-sm text-gray-600">
            {completedCount} de {totalCount} pasos completados
          </p>
        </div>
        <div className="text-2xl font-bold text-primary">{percentage}%</div>
      </div>

      <Progress value={completedCount} max={totalCount} />

      {currentStep && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium">Siguiente paso:</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-medium">{currentStep.title}</p>
              <p className="text-sm text-gray-500">{currentStep.description}</p>
            </div>
            <Button asChild size="sm">
              <Link href={currentStep.target}>Comenzar</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Interactive Tour Component
```tsx
// components/onboarding/tour.tsx
import Joyride, { Step, CallBackProps } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="nav-pets"]',
    content: 'Aquí puedes ver y gestionar las mascotas registradas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-appointments"]',
    content: 'Agenda y revisa tus citas desde aquí.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="book-button"]',
    content: '¡Haz clic aquí para agendar tu primera cita!',
    placement: 'left',
    spotlightClicks: true,
  },
  {
    target: '[data-tour="notifications"]',
    content: 'Recibirás notificaciones sobre tus citas y recordatorios aquí.',
    placement: 'bottom',
  },
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const { hasSeenTour, markTourComplete } = useOnboarding();

  useEffect(() => {
    if (!hasSeenTour) {
      // Start tour after a short delay
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleCallback = (data: CallBackProps) => {
    if (data.status === 'finished' || data.status === 'skipped') {
      markTourComplete();
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: 'var(--primary)',
          zIndex: 1000,
        },
      }}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tour',
      }}
    />
  );
}
```

### Welcome Modal
```tsx
// components/onboarding/welcome-modal.tsx
export function WelcomeModal() {
  const { isNewUser, dismissWelcome } = useOnboarding();

  if (!isNewUser) return null;

  return (
    <Dialog open onOpenChange={dismissWelcome}>
      <Dialog.Content className="max-w-md">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <PawPrint className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-2">
            ¡Bienvenido a {clinicName}!
          </h2>

          <p className="text-gray-600 mb-6">
            Estamos felices de tenerte aquí. Te guiaremos para configurar tu cuenta
            y sacar el máximo provecho de nuestra plataforma.
          </p>

          <div className="space-y-3">
            <Button onClick={startTour} className="w-full">
              Comenzar tour guiado
            </Button>
            <Button variant="outline" onClick={dismissWelcome} className="w-full">
              Explorar por mi cuenta
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
```

### Onboarding Hook
```typescript
// hooks/use-onboarding.ts
export function useOnboarding() {
  const { user } = useUser();
  const [state, setState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    if (user) {
      loadOnboardingState(user.id).then(setState);
    }
  }, [user]);

  const steps = user?.role === 'owner'
    ? OWNER_ONBOARDING_STEPS
    : STAFF_ONBOARDING_STEPS;

  const stepsWithStatus = steps.map(step => ({
    ...step,
    isCompleted: step.completed?.(user) ?? state?.completedSteps.includes(step.id),
  }));

  const completedCount = stepsWithStatus.filter(s => s.isCompleted).length;
  const currentStep = stepsWithStatus.find(s => !s.isCompleted);

  const markStepComplete = async (stepId: string) => {
    await supabase.from('onboarding_progress').upsert({
      user_id: user.id,
      step_id: stepId,
      completed_at: new Date().toISOString(),
    });
    // Refresh state
  };

  return {
    steps: stepsWithStatus,
    completedCount,
    totalCount: steps.filter(s => !s.optional).length,
    currentStep,
    isNewUser: state?.isNewUser ?? false,
    hasSeenTour: state?.hasSeenTour ?? false,
    markStepComplete,
    markTourComplete: () => markStepComplete('tour_completed'),
    dismissWelcome: () => markStepComplete('welcome_dismissed'),
  };
}
```

## Implementation Steps
1. Define onboarding steps for each user role
2. Create progress tracking database table
3. Build progress bar component
4. Implement interactive tour
5. Create welcome modal
6. Add tour triggers on first login
7. Track completion analytics

## Acceptance Criteria
- [ ] Welcome modal for new users
- [ ] Interactive tour available
- [ ] Progress bar shows completion
- [ ] Steps adapt to user role
- [ ] State persisted in database
- [ ] Can skip/resume onboarding

## Onboarding Metrics to Track
- Tour completion rate
- Time to first appointment
- Step drop-off points
- Feature adoption rates

## Related Files
- `components/onboarding/` - Onboarding components
- `hooks/use-onboarding.ts` - Onboarding state
- `lib/onboarding/` - Step definitions

## Estimated Effort
- 14 hours
  - Step definitions: 2h
  - Progress component: 2h
  - Interactive tour: 4h
  - Welcome modal: 2h
  - Database & hooks: 3h
  - Testing: 1h
