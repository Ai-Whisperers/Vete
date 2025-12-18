'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Users,
  PawPrint,
  Building2,
  Laptop,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  MessageCircle,
  Sprout,
  TreeDeciduous,
  Trees,
  Crown,
  RotateCcw
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  icon: React.ReactNode;
  options: {
    label: string;
    value: string;
    description?: string;
    points: {
      semilla: number;
      crecimiento: number;
      establecida: number;
      premium: number;
    };
  }[];
}

interface RecommendedPlan {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  monthlyPrice: number;
  setupPrice: string;
  tagline: string;
  reasons: string[];
  ctaMessage: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'patients',
    question: '¿Cuantos pacientes atienden por mes?',
    description: 'Contando consultas, vacunas, emergencias, cirugias, etc.',
    icon: <PawPrint className="w-6 h-6" />,
    options: [
      {
        label: 'Menos de 50',
        value: 'low',
        description: 'Clinica nueva o de bajo volumen',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 }
      },
      {
        label: '50 - 150',
        value: 'medium',
        description: 'Volumen moderado, creciendo',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 }
      },
      {
        label: '150 - 400',
        value: 'high',
        description: 'Clinica establecida',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 }
      },
      {
        label: 'Mas de 400',
        value: 'very_high',
        description: 'Alto volumen o multiples sucursales',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 }
      }
    ]
  },
  {
    id: 'staff',
    question: '¿Cuantos veterinarios trabajan en la clinica?',
    description: 'Incluyendo veterinarios a tiempo parcial',
    icon: <Users className="w-6 h-6" />,
    options: [
      {
        label: '1 - 2 veterinarios',
        value: 'small',
        description: 'Equipo pequeno',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 }
      },
      {
        label: '3 - 4 veterinarios',
        value: 'medium',
        description: 'Equipo mediano',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 }
      },
      {
        label: '5 - 8 veterinarios',
        value: 'large',
        description: 'Equipo grande',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 }
      },
      {
        label: 'Mas de 8',
        value: 'enterprise',
        description: 'Equipo muy grande o multiples turnos',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 }
      }
    ]
  },
  {
    id: 'current_system',
    question: '¿Que sistema usan actualmente?',
    description: 'Como manejan los registros de pacientes hoy',
    icon: <Laptop className="w-6 h-6" />,
    options: [
      {
        label: 'Papel / Excel',
        value: 'manual',
        description: 'Registros fisicos o planillas',
        points: { semilla: 2, crecimiento: 2, establecida: 1, premium: 0 }
      },
      {
        label: 'Software basico',
        value: 'basic',
        description: 'Sistema simple de gestion',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 }
      },
      {
        label: 'Software completo',
        value: 'advanced',
        description: 'Sistema veterinario profesional',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 }
      },
      {
        label: 'Multiple sistemas',
        value: 'multiple',
        description: 'Varios sistemas que quieren integrar',
        points: { semilla: 0, crecimiento: 0, establecida: 2, premium: 3 }
      }
    ]
  },
  {
    id: 'needs',
    question: '¿Que es lo mas importante para tu clinica?',
    description: 'Tu prioridad principal ahora',
    icon: <Building2 className="w-6 h-6" />,
    options: [
      {
        label: 'Empezar barato',
        value: 'budget',
        description: 'Necesito una solucion economica',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 }
      },
      {
        label: 'Crecer y profesionalizar',
        value: 'growth',
        description: 'Quiero modernizar mi clinica',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 }
      },
      {
        label: 'Funcionalidades completas',
        value: 'features',
        description: 'Necesito todas las herramientas',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 }
      },
      {
        label: 'Solucion empresarial',
        value: 'enterprise',
        description: 'Necesito algo a medida',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 }
      }
    ]
  }
];

const plans: Record<string, RecommendedPlan> = {
  semilla: {
    id: 'semilla',
    name: 'Plan Semilla',
    icon: <Sprout className="w-8 h-8" />,
    color: '#4ADE80',
    monthlyPrice: 150000,
    setupPrice: 'Gs 0 (diferido)',
    tagline: 'Perfecto para empezar sin riesgo',
    reasons: [
      'Sin costo inicial - el setup se difiere en 12 meses',
      'Todas las funcionalidades esenciales incluidas',
      'Soporte incluido para arrancar bien',
      'Podes crecer a otro plan cuando estes listo'
    ],
    ctaMessage: 'Hola! Hice el quiz de VetePy y me recomendaron el Plan Semilla. Me gustaria saber mas!'
  },
  crecimiento: {
    id: 'crecimiento',
    name: 'Plan Crecimiento',
    icon: <TreeDeciduous className="w-8 h-8" />,
    color: '#2DCEA3',
    monthlyPrice: 200000,
    setupPrice: 'Gs 500.000',
    tagline: 'El favorito de clinicas en expansion',
    reasons: [
      'Balance perfecto entre precio y funcionalidades',
      'Soporte por WhatsApp en horario laboral',
      'Todas las herramientas clinicas incluidas',
      'Modulos adicionales disponibles cuando los necesites'
    ],
    ctaMessage: 'Hola! Hice el quiz de VetePy y me recomendaron el Plan Crecimiento. Me gustaria saber mas!'
  },
  establecida: {
    id: 'establecida',
    name: 'Plan Establecida',
    icon: <Trees className="w-8 h-8" />,
    color: '#5C6BFF',
    monthlyPrice: 300000,
    setupPrice: 'Gs 700.000',
    tagline: 'Para clinicas que quieren lo mejor',
    reasons: [
      'Soporte prioritario 24/7 por WhatsApp',
      'WhatsApp Business API incluido',
      'Modulos de laboratorio y hospitalizacion',
      'Account manager dedicado para tu clinica'
    ],
    ctaMessage: 'Hola! Hice el quiz de VetePy y me recomendaron el Plan Establecida. Me gustaria saber mas!'
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    icon: <Crown className="w-8 h-8" />,
    color: '#F59E0B',
    monthlyPrice: 500000,
    setupPrice: 'A medida',
    tagline: 'Solucion empresarial completa',
    reasons: [
      'Soporte para multiples sucursales',
      'API personalizada e integraciones',
      'Desarrollo a medida segun necesidades',
      'SLA garantizado y revisiones trimestrales'
    ],
    ctaMessage: 'Hola! Hice el quiz de VetePy y me recomendaron el Plan Premium. Tengo una clinica grande y me gustaria saber mas!'
  }
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price);
}

export function PricingQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const calculateRecommendation = (): string => {
    const scores = { semilla: 0, crecimiento: 0, establecida: 0, premium: 0 };

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find((o) => o.value === answer);
        if (option) {
          scores.semilla += option.points.semilla;
          scores.crecimiento += option.points.crecimiento;
          scores.establecida += option.points.establecida;
          scores.premium += option.points.premium;
        }
      }
    });

    // Find highest score
    let maxScore = 0;
    let recommended = 'crecimiento';
    Object.entries(scores).forEach(([plan, score]) => {
      if (score > maxScore) {
        maxScore = score;
        recommended = plan;
      }
    });

    return recommended;
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  const recommendedPlanId = calculateRecommendation();
  const recommendedPlan = plans[recommendedPlanId];

  if (showResult) {
    return (
      <section id="quiz" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: `${recommendedPlan.color}10` }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Result Card */}
            <div
              className="p-8 md:p-10 rounded-3xl border-2 bg-gradient-to-br from-white/10 to-white/5"
              style={{ borderColor: `${recommendedPlan.color}50` }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-4">
                  <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
                  <span className="text-white/70 text-sm">Tu plan recomendado</span>
                </div>

                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${recommendedPlan.color}20`, color: recommendedPlan.color }}
                >
                  {recommendedPlan.icon}
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  {recommendedPlan.name}
                </h2>
                <p className="text-white/60">{recommendedPlan.tagline}</p>
              </div>

              {/* Pricing */}
              <div
                className="p-6 rounded-2xl mb-8"
                style={{ backgroundColor: `${recommendedPlan.color}15` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/70">Mensualidad</span>
                  <div>
                    <span
                      className="text-3xl font-black"
                      style={{ color: recommendedPlan.color }}
                    >
                      Gs {formatPrice(recommendedPlan.monthlyPrice)}
                    </span>
                    <span className="text-white/50">/mes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Configuracion</span>
                  <span className="text-xl font-bold text-white">{recommendedPlan.setupPrice}</span>
                </div>
              </div>

              {/* Reasons */}
              <div className="mb-8">
                <h3 className="text-white font-bold mb-4">Por que te lo recomendamos:</h3>
                <div className="space-y-3">
                  {recommendedPlan.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: recommendedPlan.color }} />
                      <span className="text-white/70">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/595981324569?text=${encodeURIComponent(recommendedPlan.ctaMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-full text-[#0F172A] transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${recommendedPlan.color}, ${recommendedPlan.color}CC)`,
                    boxShadow: `0 10px 40px ${recommendedPlan.color}30`
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Quiero este plan
                </a>

                <button
                  onClick={resetQuiz}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/70 font-medium rounded-full hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Volver a hacer el quiz
                </button>
              </div>
            </div>

            {/* See all plans link */}
            <div className="text-center mt-6">
              <a href="#precios" className="text-white/50 hover:text-white text-sm transition-colors">
                Ver todos los planes →
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quiz" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-[#5C6BFF]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-[#2DCEA3]/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C6BFF]/10 border border-[#5C6BFF]/20 mb-4">
            <HelpCircle className="w-4 h-4 text-[#5C6BFF]" />
            <span className="text-[#5C6BFF] text-sm font-medium">Quiz de 4 preguntas</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            ¿Que plan te conviene?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Responde estas preguntas rapidas y te recomendamos el plan perfecto para tu clinica.
          </p>
        </div>

        {/* Quiz Card */}
        <div className="max-w-2xl mx-auto">
          <div className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-white/50 mb-2">
                <span>Pregunta {currentStep + 1} de {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2DCEA3] to-[#5C6BFF] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2DCEA3]/10 flex items-center justify-center text-[#2DCEA3]">
                  {currentQuestion.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentQuestion.question}</h3>
                  <p className="text-white/50 text-sm">{currentQuestion.description}</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'bg-[#2DCEA3]/10 border-[#2DCEA3]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">{option.label}</span>
                      {option.description && (
                        <p className="text-white/50 text-sm mt-1">{option.description}</p>
                      )}
                    </div>
                    {answers[currentQuestion.id] === option.value && (
                      <Check className="w-5 h-5 text-[#2DCEA3]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  currentStep === 0
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              {answers[currentQuestion.id] && currentStep < questions.length - 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#2DCEA3] text-[#0F172A] font-bold rounded-full hover:bg-[#2DCEA3]/90 transition-colors"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {answers[currentQuestion.id] && currentStep === questions.length - 1 && (
                <button
                  onClick={() => setShowResult(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#2DCEA3] to-[#5C6BFF] text-[#0F172A] font-bold rounded-full hover:shadow-lg transition-all"
                >
                  Ver mi recomendacion
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
