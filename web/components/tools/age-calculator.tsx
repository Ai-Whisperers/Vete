"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import Link from "next/link"; // Corrected import for Link

type PetType = "dog" | "cat";
type DogSize = "small" | "medium" | "large";

export function AgeCalculator({ config }: { config: any }) {
  const [petType, setPetType] = useState<PetType>("dog");
  const [dogSize, setDogSize] = useState<DogSize>("medium");
  const [age, setAge] = useState<number | "">("");
  const [humanAge, setHumanAge] = useState<number | null>(null);

  const calculateAge = () => {
    if (age === "" || age < 0) return;

    let result = 0;
    const year = Number(age);

    if (petType === "cat") {
      if (year === 1) result = 15;
      else if (year === 2) result = 24;
      else result = 24 + (year - 2) * 4;
    } else {
      // Dogs
      if (year === 1) result = 15;
      else if (year === 2) result = 24;
      else {
        // After 2 years, specific by size
        const multiplier = dogSize === "small" ? 4 : dogSize === "medium" ? 5 : 6; // simplified formula
        result = 24 + (year - 2) * multiplier;
      }
    }
    setHumanAge(Math.floor(result));
  };

  const getLifeStage = (hAge: number) => {
    if (hAge < 20) return { label: "Joven / Junior", color: "bg-green-100 text-green-800", icon: "Zap" };
    if (hAge < 50) return { label: "Adulto", color: "bg-blue-100 text-blue-800", icon: "ShieldCheck" };
    return { label: "Senior / Abuelo", color: "bg-purple-100 text-purple-800", icon: "Heart" };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[var(--primary)] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <Icons.Calculator className="w-12 h-12 mx-auto mb-4 text-[var(--accent)]" />
          <h2 className="text-3xl font-heading font-black mb-2">Calculadora de Edad</h2>
          <p className="text-white/90">Descubre la edad real de tu mascota en años humanos.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Step 1: Pet Type */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              1. ¿Qué mascota tienes?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPetType("dog")}
                className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  petType === "dog"
                    ? "border-[var(--primary)] bg-[var(--bg-subtle)] text-[var(--primary)]"
                    : "border-gray-100 hover:border-gray-200 text-gray-400"
                }`}
              >
                <Icons.Dog className="w-8 h-8" />
                <span className="font-bold">Perro</span>
                {petType === "dog" && (
                  <motion.div layoutId="check" className="absolute top-2 right-2">
                    <Icons.CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                  </motion.div>
                )}
              </button>
              <button
                onClick={() => setPetType("cat")}
                className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  petType === "cat"
                    ? "border-[var(--primary)] bg-[var(--bg-subtle)] text-[var(--primary)]"
                    : "border-gray-100 hover:border-gray-200 text-gray-400"
                }`}
              >
                <Icons.Cat className="w-8 h-8" />
                <span className="font-bold">Gato</span>
                {petType === "cat" && (
                  <motion.div layoutId="check" className="absolute top-2 right-2">
                    <Icons.CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                  </motion.div>
                )}
              </button>
            </div>
          </div>

          {/* Step 1.5: Dog Size (Conditional) */}
          <AnimatePresence>
            {petType === "dog" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. ¿De qué tamaño es?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setDogSize(size)}
                      className={`py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${
                        dogSize === size
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {size === "small" ? "Pequeño" : size === "medium" ? "Mediano" : "Grande"}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Age Input */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {petType === "dog" ? "3" : "2"}. ¿Cuántos años tiene?
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 5"
                className="flex-1 text-4xl font-black p-4 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 text-center outline-none transition-all"
                min="0"
                max="30"
              />
              <button
                onClick={calculateAge}
                disabled={age === ""}
                className="bg-[var(--primary)] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Calcular
              </button>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence>
            {humanAge !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8 border-t border-dashed border-gray-200"
              >
                <div className="text-center space-y-2">
                  <p className="text-[var(--text-secondary)] font-medium">En años humanos, tu mascota tiene:</p>
                  <h3 className="text-6xl font-black text-[var(--primary)] mb-4">
                    {humanAge} <span className="text-2xl text-gray-400">años</span>
                  </h3>
                  
                  {(() => {
                    const stage = getLifeStage(humanAge);
                    const StatusIcon = Icons[stage.icon as keyof typeof Icons] as any || Icons.Heart;
                    return (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${stage.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            {stage.label}
                        </div>
                    );
                  })()}

                  <div className="mt-8 bg-[var(--bg-subtle)] p-6 rounded-xl text-left">
                    <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-2">
                        <Icons.Stethoscope className="w-5 h-5 text-[var(--primary)]" />
                        Recomendación Veterinaria:
                    </h4>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {humanAge > 50 
                            ? "Tu mascota es considerada Senior. Se recomiendan chequeos geriátricos cada 6 meses, prestando atención a las articulaciones, dientes y riñones."
                            : "Tu mascota está en su plenitud. Mantén sus vacunas al día y cuida su peso para asegurar una larga vida saludable."
                        }
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-end">
                         <Link 
                            href={`https://wa.me/${config.contact.whatsapp_number}?text=Hola, quiero agendar un chequeo para mi mascota que tiene ${age} años (aprox ${humanAge} años humanos).`}
                            target="_blank"
                            className="text-[var(--primary)] font-bold text-sm hover:underline flex items-center gap-1"
                        >
                            Agendar Turno <Icons.ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
