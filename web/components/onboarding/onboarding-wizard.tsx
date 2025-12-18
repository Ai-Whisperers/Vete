"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Dog,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  PawPrint,
  Camera,
  Mail,
  Check
} from "lucide-react";
import { PhotoUpload } from "@/components/pets/photo-upload";

interface OnboardingWizardProps {
  clinic: string;
  userEmail?: string;
  userName?: string;
}

type Step = "welcome" | "add-pet" | "preferences" | "complete";

interface PetData {
  name: string;
  species: "dog" | "cat";
  breed: string;
  photo?: File;
}

interface Preferences {
  vaccineReminders: boolean;
  appointmentReminders: boolean;
  promotions: boolean;
}

export function OnboardingWizard({
  clinic,
  userEmail,
  userName,
}: OnboardingWizardProps): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [petData, setPetData] = useState<PetData>({
    name: "",
    species: "dog",
    breed: "",
  });
  const [preferences, setPreferences] = useState<Preferences>({
    vaccineReminders: true,
    appointmentReminders: true,
    promotions: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "welcome", label: "Bienvenida", icon: <Sparkles className="w-5 h-5" /> },
    { id: "add-pet", label: "Tu Mascota", icon: <PawPrint className="w-5 h-5" /> },
    { id: "preferences", label: "Preferencias", icon: <Bell className="w-5 h-5" /> },
    { id: "complete", label: "Listo", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  }, [currentStepIndex, steps]);

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  }, [currentStepIndex, steps]);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Save pet if provided
      if (petData.name) {
        const formData = new FormData();
        formData.append("clinic", clinic);
        formData.append("name", petData.name);
        formData.append("species", petData.species);
        formData.append("breed", petData.breed);
        if (petData.photo) {
          formData.append("photo", petData.photo);
        }

        await fetch("/api/pets", {
          method: "POST",
          body: formData,
        });
      }

      // Save preferences
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic,
          preferences,
        }),
      });

      // Mark onboarding as complete
      await fetch("/api/user/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic }),
      });

      setCurrentStep("complete");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [clinic, petData, preferences]);

  const goToDashboard = useCallback(() => {
    router.push(`/${clinic}/portal/dashboard`);
  }, [clinic, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-subtle)] to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index <= currentStepIndex
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-2 rounded transition-colors ${
                      index < currentStepIndex ? "bg-[var(--primary)]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            Paso {currentStepIndex + 1} de {steps.length}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h1 className="text-3xl font-black text-[var(--text-primary)]">
                ¡Bienvenido{userName ? `, ${userName}` : ""}!
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Estamos felices de tenerte aquí. Vamos a configurar tu cuenta en
                solo unos pasos para que puedas aprovechar todas las funciones.
              </p>
              {userEmail && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
                  <Mail className="w-4 h-4" />
                  {userEmail}
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              <button
                onClick={goNext}
                className="w-full max-w-xs mx-auto bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Comenzar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Add Pet Step */}
          {currentStep === "add-pet" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[var(--text-primary)]">
                  Cuéntanos sobre tu mascota
                </h2>
                <p className="text-gray-500 mt-2">
                  Puedes agregar más mascotas después
                </p>
              </div>

              {/* Photo Upload */}
              <PhotoUpload
                name="pet-photo"
                onFileSelect={(file) => setPetData((p) => ({ ...p, photo: file }))}
                onFileRemove={() => setPetData((p) => ({ ...p, photo: undefined }))}
                placeholder="Foto de mascota"
                shape="circle"
                size={120}
              />

              {/* Species Selection */}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPetData((p) => ({ ...p, species: "dog" }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    petData.species === "dog"
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Dog className={`w-8 h-8 ${petData.species === "dog" ? "text-[var(--primary)]" : "text-gray-400"}`} />
                  <span className={`font-bold ${petData.species === "dog" ? "text-[var(--primary)]" : "text-gray-600"}`}>
                    Perro
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPetData((p) => ({ ...p, species: "cat" }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    petData.species === "cat"
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <PawPrint className={`w-8 h-8 ${petData.species === "cat" ? "text-[var(--primary)]" : "text-gray-400"}`} />
                  <span className={`font-bold ${petData.species === "cat" ? "text-[var(--primary)]" : "text-gray-600"}`}>
                    Gato
                  </span>
                </button>
              </div>

              {/* Name & Breed */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Nombre de tu mascota
                  </label>
                  <input
                    type="text"
                    value={petData.name}
                    onChange={(e) => setPetData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Firulais"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Raza (opcional)
                  </label>
                  <input
                    type="text"
                    value={petData.breed}
                    onChange={(e) => setPetData((p) => ({ ...p, breed: e.target.value }))}
                    placeholder="Ej: Golden Retriever"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={goBack}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Atrás
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {petData.name ? "Continuar" : "Saltar"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Preferences Step */}
          {currentStep === "preferences" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[var(--text-primary)]">
                  Configura tus notificaciones
                </h2>
                <p className="text-gray-500 mt-2">
                  Elige qué información quieres recibir
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Recordatorios de vacunas</p>
                      <p className="text-sm text-gray-500">Te avisamos cuando una vacuna está por vencer</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.vaccineReminders}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, vaccineReminders: e.target.checked }))
                    }
                    className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Recordatorios de citas</p>
                      <p className="text-sm text-gray-500">Confirmaciones y recordatorios de tus citas</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.appointmentReminders}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, appointmentReminders: e.target.checked }))
                    }
                    className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Ofertas y promociones</p>
                      <p className="text-sm text-gray-500">Descuentos exclusivos y novedades</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, promotions: e.target.checked }))
                    }
                    className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </label>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={goBack}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Finalizar"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-[var(--text-primary)]">
                ¡Todo listo!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Tu cuenta está configurada. Ahora puedes explorar todas las
                funciones del portal de mascotas.
              </p>

              <div className="bg-[var(--primary)]/5 rounded-2xl p-6 text-left max-w-sm mx-auto">
                <h3 className="font-bold text-[var(--primary)] mb-3">
                  Próximos pasos:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Agendar tu primera cita
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Completar el perfil de tu mascota
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Explorar nuestra tienda
                  </li>
                </ul>
              </div>

              <button
                onClick={goToDashboard}
                className="w-full max-w-xs mx-auto bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Ir al Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
