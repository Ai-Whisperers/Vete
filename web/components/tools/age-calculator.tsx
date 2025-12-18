"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import Link from "next/link";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type Species = "dog" | "cat" | "rabbit" | "hamster" | "guinea_pig" | "bird" | "ferret" | "horse" | "turtle" | "fish";
type DogSize = "toy" | "small" | "medium" | "large" | "giant";
type CatType = "indoor" | "outdoor" | "mixed";
type BirdCategory = "finch" | "parakeet" | "cockatiel" | "parrot" | "macaw";
type TurtleType = "aquatic" | "terrestrial";
type FishType = "tropical" | "goldfish" | "koi";
type FormulaType = "classic" | "logarithmic";

interface SpeciesConfig {
  label: string;
  labelPlural: string;
  icon: string;
  emoji: string;
  avgLifespan: { min: number; max: number };
  description: string;
  hasSubOptions: boolean;
  sources: string[];
}

interface SizeConfig {
  label: string;
  description: string;
  weightRange?: string;
  multiplier: number;
  seniorAge: number;
  year1Equiv: number;
  year2Equiv: number;
}

interface CalculationResult {
  humanAge: number;
  exactHumanAge: number;
  breakdown: CalculationStep[];
  formula: string;
  lifeStage: LifeStage;
  healthTips: string[];
  milestones: Milestone[];
  lifeExpectancy: { min: number; max: number; remaining: { min: number; max: number } };
}

interface CalculationStep {
  description: string;
  calculation: string;
  result: string;
}

interface LifeStage {
  key: "puppy" | "junior" | "adult" | "mature" | "senior" | "geriatric";
  label: string;
  ageRange: string;
  color: string;
  icon: string;
  description: string;
  checkupFrequency: string;
  dietTips: string;
  exerciseTips: string;
}

interface Milestone {
  petAge: number;
  humanAge: number;
  description: string;
  reached: boolean;
}

interface AgeCalculatorConfig {
  contact: {
    whatsapp_number?: string;
  };
}

// =============================================================================
// SPECIES CONFIGURATION
// =============================================================================

const SPECIES_CONFIG: Record<Species, SpeciesConfig> = {
  dog: {
    label: "Perro",
    labelPlural: "Perros",
    icon: "Dog",
    emoji: "🐕",
    avgLifespan: { min: 10, max: 13 },
    description: "El envejecimiento varía significativamente según el tamaño de la raza.",
    hasSubOptions: true,
    sources: ["American Veterinary Medical Association", "UCSD Epigenetic Clock Study (2019)"],
  },
  cat: {
    label: "Gato",
    labelPlural: "Gatos",
    icon: "Cat",
    emoji: "🐈",
    avgLifespan: { min: 12, max: 18 },
    description: "Los gatos de interior viven significativamente más que los de exterior.",
    hasSubOptions: true,
    sources: ["American Association of Feline Practitioners", "Journal of Feline Medicine and Surgery"],
  },
  rabbit: {
    label: "Conejo",
    labelPlural: "Conejos",
    icon: "Rabbit",
    emoji: "🐰",
    avgLifespan: { min: 8, max: 12 },
    description: "Los conejos domésticos bien cuidados pueden vivir más de 10 años.",
    hasSubOptions: false,
    sources: ["House Rabbit Society", "Rabbit Welfare Association"],
  },
  hamster: {
    label: "Hámster",
    labelPlural: "Hámsteres",
    icon: "Squirrel",
    emoji: "🐹",
    avgLifespan: { min: 2, max: 3 },
    description: "Vida corta pero intensa. Cada mes cuenta significativamente.",
    hasSubOptions: false,
    sources: ["American Hamster Association"],
  },
  guinea_pig: {
    label: "Cobayo",
    labelPlural: "Cobayos",
    icon: "Squirrel",
    emoji: "🐹",
    avgLifespan: { min: 5, max: 7 },
    description: "También conocido como cuy o conejillo de indias.",
    hasSubOptions: false,
    sources: ["Guinea Pig Veterinary Guidelines"],
  },
  bird: {
    label: "Ave",
    labelPlural: "Aves",
    icon: "Bird",
    emoji: "🦜",
    avgLifespan: { min: 5, max: 80 },
    description: "La esperanza de vida varía enormemente según la especie.",
    hasSubOptions: true,
    sources: ["Association of Avian Veterinarians"],
  },
  ferret: {
    label: "Hurón",
    labelPlural: "Hurones",
    icon: "Squirrel",
    emoji: "🦡",
    avgLifespan: { min: 6, max: 10 },
    description: "Propensos a problemas adrenales y insulinoma después de los 3 años.",
    hasSubOptions: false,
    sources: ["American Ferret Association"],
  },
  horse: {
    label: "Caballo",
    labelPlural: "Caballos",
    icon: "Cherry",
    emoji: "🐴",
    avgLifespan: { min: 25, max: 30 },
    description: "Los ponis suelen vivir más que los caballos de razas grandes.",
    hasSubOptions: false,
    sources: ["American Association of Equine Practitioners"],
  },
  turtle: {
    label: "Tortuga",
    labelPlural: "Tortugas",
    icon: "Shell",
    emoji: "🐢",
    avgLifespan: { min: 20, max: 100 },
    description: "Algunas especies pueden vivir más de un siglo.",
    hasSubOptions: true,
    sources: ["Turtle Survival Alliance"],
  },
  fish: {
    label: "Pez",
    labelPlural: "Peces",
    icon: "Fish",
    emoji: "🐠",
    avgLifespan: { min: 2, max: 25 },
    description: "La longevidad depende mucho de la especie y calidad del agua.",
    hasSubOptions: true,
    sources: ["World Aquaculture Society"],
  },
};

// =============================================================================
// DOG SIZE CONFIGURATION (Research-based)
// =============================================================================

const DOG_SIZE_CONFIG: Record<DogSize, SizeConfig> = {
  toy: {
    label: "Toy / Miniatura",
    description: "Chihuahua, Yorkshire, Pomerania",
    weightRange: "< 4 kg",
    multiplier: 4.0,
    seniorAge: 11,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  small: {
    label: "Pequeño",
    description: "Beagle, Cocker Spaniel, Bulldog Francés",
    weightRange: "4-10 kg",
    multiplier: 4.5,
    seniorAge: 10,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  medium: {
    label: "Mediano",
    description: "Border Collie, Bulldog Inglés, Husky",
    weightRange: "10-25 kg",
    multiplier: 5.0,
    seniorAge: 8,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  large: {
    label: "Grande",
    description: "Labrador, Golden Retriever, Pastor Alemán",
    weightRange: "25-45 kg",
    multiplier: 5.5,
    seniorAge: 7,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  giant: {
    label: "Gigante",
    description: "Gran Danés, San Bernardo, Mastín",
    weightRange: "> 45 kg",
    multiplier: 7.0,
    seniorAge: 5,
    year1Equiv: 12,
    year2Equiv: 22,
  },
};

// =============================================================================
// CAT TYPE CONFIGURATION
// =============================================================================

const CAT_TYPE_CONFIG: Record<CatType, SizeConfig> = {
  indoor: {
    label: "Interior",
    description: "Vive exclusivamente dentro de casa",
    multiplier: 4.0,
    seniorAge: 11,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  outdoor: {
    label: "Exterior",
    description: "Acceso libre al exterior",
    multiplier: 4.5,
    seniorAge: 8,
    year1Equiv: 15,
    year2Equiv: 24,
  },
  mixed: {
    label: "Mixto",
    description: "Interior con salidas supervisadas",
    multiplier: 4.2,
    seniorAge: 10,
    year1Equiv: 15,
    year2Equiv: 24,
  },
};

// =============================================================================
// BIRD CATEGORY CONFIGURATION
// =============================================================================

const BIRD_CONFIG: Record<BirdCategory, SizeConfig & { avgLifespan: { min: number; max: number } }> = {
  finch: {
    label: "Pinzón / Canario",
    description: "Aves pequeñas de jaula",
    multiplier: 7.0,
    seniorAge: 5,
    year1Equiv: 20,
    year2Equiv: 30,
    avgLifespan: { min: 5, max: 10 },
  },
  parakeet: {
    label: "Periquito",
    description: "Periquito australiano, inglés",
    multiplier: 5.5,
    seniorAge: 6,
    year1Equiv: 18,
    year2Equiv: 28,
    avgLifespan: { min: 7, max: 15 },
  },
  cockatiel: {
    label: "Cockatiel / Agaporni",
    description: "Aves medianas sociables",
    multiplier: 3.5,
    seniorAge: 12,
    year1Equiv: 15,
    year2Equiv: 22,
    avgLifespan: { min: 15, max: 25 },
  },
  parrot: {
    label: "Loro / Cotorra",
    description: "Amazonas, Grises, Eclectus",
    multiplier: 1.5,
    seniorAge: 30,
    year1Equiv: 8,
    year2Equiv: 12,
    avgLifespan: { min: 40, max: 60 },
  },
  macaw: {
    label: "Guacamaya / Cacatúa",
    description: "Aves grandes y longevas",
    multiplier: 1.0,
    seniorAge: 40,
    year1Equiv: 5,
    year2Equiv: 8,
    avgLifespan: { min: 50, max: 80 },
  },
};

// =============================================================================
// OTHER SPECIES CONFIGURATION
// =============================================================================

const OTHER_SPECIES_CONFIG: Record<string, SizeConfig> = {
  rabbit: {
    label: "Conejo doméstico",
    description: "Razas enanas viven más",
    multiplier: 6.0,
    seniorAge: 6,
    year1Equiv: 21,
    year2Equiv: 27,
  },
  hamster: {
    label: "Hámster sirio/enano",
    description: "Vida muy corta e intensa",
    multiplier: 25.0,
    seniorAge: 1.5,
    year1Equiv: 26,
    year2Equiv: 45,
  },
  guinea_pig: {
    label: "Cobayo/Cuy",
    description: "Muy social, vive en grupos",
    multiplier: 10.0,
    seniorAge: 4,
    year1Equiv: 15,
    year2Equiv: 25,
  },
  ferret: {
    label: "Hurón doméstico",
    description: "Propenso a enfermedades después de 3 años",
    multiplier: 6.0,
    seniorAge: 5,
    year1Equiv: 14,
    year2Equiv: 24,
  },
  horse: {
    label: "Caballo/Poni",
    description: "Los ponis viven más",
    multiplier: 2.5,
    seniorAge: 20,
    year1Equiv: 6,
    year2Equiv: 13,
  },
  turtle_aquatic: {
    label: "Tortuga acuática",
    description: "Orejas rojas, pintadas",
    multiplier: 1.0,
    seniorAge: 25,
    year1Equiv: 2,
    year2Equiv: 4,
  },
  turtle_terrestrial: {
    label: "Tortuga terrestre",
    description: "Sulcata, leopardo, mediterránea",
    multiplier: 0.5,
    seniorAge: 50,
    year1Equiv: 1,
    year2Equiv: 2,
  },
  fish_tropical: {
    label: "Pez tropical",
    description: "Bettas, tetras, guppies",
    multiplier: 15.0,
    seniorAge: 2,
    year1Equiv: 25,
    year2Equiv: 40,
  },
  fish_goldfish: {
    label: "Pez dorado",
    description: "Goldfish, cometa, shubunkin",
    multiplier: 4.0,
    seniorAge: 8,
    year1Equiv: 10,
    year2Equiv: 18,
  },
  fish_koi: {
    label: "Koi / Carpa",
    description: "Muy longevos en estanques",
    multiplier: 2.0,
    seniorAge: 20,
    year1Equiv: 5,
    year2Equiv: 10,
  },
};

// =============================================================================
// LIFE STAGES CONFIGURATION
// =============================================================================

const LIFE_STAGES: Record<string, Omit<LifeStage, "ageRange">> = {
  puppy: {
    key: "puppy",
    label: "Cachorro",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "Baby",
    description: "Fase de crecimiento rápido y desarrollo neurológico crítico.",
    checkupFrequency: "Mensual durante el primer año",
    dietTips: "Alimento específico para cachorros con alto contenido proteico.",
    exerciseTips: "Ejercicio moderado; evitar impacto en articulaciones en desarrollo.",
  },
  junior: {
    key: "junior",
    label: "Juvenil",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "Zap",
    description: "Adolescencia con alta energía y consolidación del comportamiento.",
    checkupFrequency: "Cada 6 meses",
    dietTips: "Transición gradual a alimento adulto según tamaño.",
    exerciseTips: "Alta actividad física para canalizar energía.",
  },
  adult: {
    key: "adult",
    label: "Adulto",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "ShieldCheck",
    description: "Madurez física completa. Mejor momento para mantener hábitos saludables.",
    checkupFrequency: "Anual",
    dietTips: "Dieta de mantenimiento; controlar porciones para evitar obesidad.",
    exerciseTips: "Rutina regular de ejercicio según la especie.",
  },
  mature: {
    key: "mature",
    label: "Maduro",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "Clock",
    description: "Inicio del envejecimiento. Pueden aparecer primeros signos de edad.",
    checkupFrequency: "Cada 6 meses con análisis de sangre",
    dietTips: "Considerar alimento para adultos mayores; suplementos articulares.",
    exerciseTips: "Mantener actividad pero reducir intensidad si hay rigidez.",
  },
  senior: {
    key: "senior",
    label: "Senior",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "Heart",
    description: "Etapa geriátrica. Requiere cuidados preventivos especializados.",
    checkupFrequency: "Cada 4-6 meses con chequeo geriátrico completo",
    dietTips: "Alimento senior; proteína de alta calidad; control de fósforo.",
    exerciseTips: "Ejercicio suave y regular; caminatas cortas frecuentes.",
  },
  geriatric: {
    key: "geriatric",
    label: "Geriátrico",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: "HeartHandshake",
    description: "Etapa final. Enfoque en calidad de vida y comodidad.",
    checkupFrequency: "Cada 3-4 meses o según necesidad",
    dietTips: "Alimento muy digestible; considerar alimentación blanda.",
    exerciseTips: "Solo lo que el animal tolere cómodamente.",
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgeCalculator({ config }: { config: AgeCalculatorConfig }) {
  // State
  const [species, setSpecies] = useState<Species>("dog");
  const [dogSize, setDogSize] = useState<DogSize>("medium");
  const [catType, setCatType] = useState<CatType>("indoor");
  const [birdCategory, setBirdCategory] = useState<BirdCategory>("parakeet");
  const [turtleType, setTurtleType] = useState<TurtleType>("aquatic");
  const [fishType, setFishType] = useState<FishType>("tropical");
  const [age, setAge] = useState<string>("");
  const [ageUnit, setAgeUnit] = useState<"years" | "months">("years");
  const [formulaType, setFormulaType] = useState<FormulaType>("classic");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "health" | "milestones">("result");
  const [showMethodology, setShowMethodology] = useState(false);

  // Get current species config
  const speciesConfig = SPECIES_CONFIG[species];

  // Get current sub-config based on species
  const getSubConfig = useCallback((): SizeConfig => {
    switch (species) {
      case "dog":
        return DOG_SIZE_CONFIG[dogSize];
      case "cat":
        return CAT_TYPE_CONFIG[catType];
      case "bird":
        return BIRD_CONFIG[birdCategory];
      case "turtle":
        return OTHER_SPECIES_CONFIG[`turtle_${turtleType}`];
      case "fish":
        return OTHER_SPECIES_CONFIG[`fish_${fishType}`];
      default:
        return OTHER_SPECIES_CONFIG[species] || OTHER_SPECIES_CONFIG.rabbit;
    }
  }, [species, dogSize, catType, birdCategory, turtleType, fishType]);

  // Convert age to years
  const ageInYears = useMemo(() => {
    const numAge = parseFloat(age) || 0;
    return ageUnit === "months" ? numAge / 12 : numAge;
  }, [age, ageUnit]);

  // Dynamic age presets based on species
  const agePresets = useMemo(() => {
    switch (species) {
      case "hamster":
        return [{ value: 3, unit: "months" }, { value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 1.5, unit: "years" }, { value: 2, unit: "years" }, { value: 2.5, unit: "years" }];
      case "guinea_pig":
        return [{ value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 2, unit: "years" }, { value: 3, unit: "years" }, { value: 4, unit: "years" }, { value: 5, unit: "years" }, { value: 6, unit: "years" }];
      case "rabbit":
      case "ferret":
        return [{ value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 2, unit: "years" }, { value: 4, unit: "years" }, { value: 6, unit: "years" }, { value: 8, unit: "years" }];
      case "horse":
        return [{ value: 1, unit: "years" }, { value: 3, unit: "years" }, { value: 5, unit: "years" }, { value: 10, unit: "years" }, { value: 15, unit: "years" }, { value: 20, unit: "years" }, { value: 25, unit: "years" }];
      case "turtle":
        return turtleType === "terrestrial"
          ? [{ value: 5, unit: "years" }, { value: 10, unit: "years" }, { value: 25, unit: "years" }, { value: 50, unit: "years" }, { value: 75, unit: "years" }, { value: 100, unit: "years" }]
          : [{ value: 1, unit: "years" }, { value: 5, unit: "years" }, { value: 10, unit: "years" }, { value: 15, unit: "years" }, { value: 20, unit: "years" }, { value: 25, unit: "years" }];
      case "fish":
        return fishType === "koi"
          ? [{ value: 1, unit: "years" }, { value: 5, unit: "years" }, { value: 10, unit: "years" }, { value: 15, unit: "years" }, { value: 20, unit: "years" }]
          : [{ value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 2, unit: "years" }, { value: 3, unit: "years" }, { value: 5, unit: "years" }];
      case "bird":
        if (birdCategory === "macaw" || birdCategory === "parrot") {
          return [{ value: 1, unit: "years" }, { value: 5, unit: "years" }, { value: 10, unit: "years" }, { value: 20, unit: "years" }, { value: 30, unit: "years" }, { value: 50, unit: "years" }];
        }
        return [{ value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 3, unit: "years" }, { value: 5, unit: "years" }, { value: 8, unit: "years" }, { value: 12, unit: "years" }];
      default:
        return [{ value: 6, unit: "months" }, { value: 1, unit: "years" }, { value: 2, unit: "years" }, { value: 5, unit: "years" }, { value: 7, unit: "years" }, { value: 10, unit: "years" }, { value: 12, unit: "years" }, { value: 15, unit: "years" }];
    }
  }, [species, birdCategory, turtleType, fishType]);

  // Calculate age
  const calculateAge = useCallback(() => {
    if (!age || ageInYears <= 0) return;

    const subConfig = getSubConfig();
    const year = ageInYears;
    let humanAge = 0;
    const breakdown: CalculationStep[] = [];
    let formula = "";

    // Calculate based on species and formula type
    if (species === "dog" && formulaType === "logarithmic") {
      // UCSD 2019 epigenetic clock formula
      humanAge = year > 0 ? 16 * Math.log(year) + 31 : 0;
      formula = "Edad Humana = 16 × ln(edad_perro) + 31";
      breakdown.push({
        description: "Fórmula logarítmica (Estudio UCSD 2019)",
        calculation: `16 × ln(${year.toFixed(2)}) + 31`,
        result: `16 × ${Math.log(year).toFixed(4)} + 31 = ${humanAge.toFixed(1)}`,
      });
    } else {
      // Classic piecewise formula
      const { year1Equiv, year2Equiv, multiplier } = subConfig;

      if (year <= 1) {
        humanAge = year * year1Equiv;
        breakdown.push({
          description: "Primer año (desarrollo rápido)",
          calculation: `${year.toFixed(2)} × ${year1Equiv}`,
          result: `= ${humanAge.toFixed(1)} años humanos`,
        });
      } else if (year <= 2) {
        const firstYear = year1Equiv;
        const secondYearRate = year2Equiv - year1Equiv;
        const secondPortion = (year - 1) * secondYearRate;
        humanAge = firstYear + secondPortion;
        breakdown.push({
          description: "Año 1 (desarrollo inicial)",
          calculation: `${year1Equiv} años humanos`,
          result: `= ${year1Equiv}`,
        });
        breakdown.push({
          description: "Año 1-2 (maduración)",
          calculation: `(${year.toFixed(2)} - 1) × ${secondYearRate}`,
          result: `= ${secondPortion.toFixed(1)}`,
        });
        breakdown.push({
          description: "Total",
          calculation: `${year1Equiv} + ${secondPortion.toFixed(1)}`,
          result: `= ${humanAge.toFixed(1)} años humanos`,
        });
      } else {
        const base = year2Equiv;
        const additional = (year - 2) * multiplier;
        humanAge = base + additional;
        breakdown.push({
          description: "Base (primeros 2 años)",
          calculation: `${year2Equiv} años humanos`,
          result: `= ${year2Equiv}`,
        });
        breakdown.push({
          description: `Años adicionales (×${multiplier}/año)`,
          calculation: `(${year.toFixed(2)} - 2) × ${multiplier}`,
          result: `= ${additional.toFixed(1)}`,
        });
        breakdown.push({
          description: "Total",
          calculation: `${year2Equiv} + ${additional.toFixed(1)}`,
          result: `= ${humanAge.toFixed(1)} años humanos`,
        });
      }

      formula = `${year2Equiv} + (edad - 2) × ${multiplier}`;
    }

    // Determine life stage
    const lifeStage = getLifeStage(year, subConfig.seniorAge);

    // Generate milestones
    const milestones = generateMilestones(year, subConfig, humanAge);

    // Calculate life expectancy
    let lifeExpectancy = speciesConfig.avgLifespan;
    if (species === "bird") {
      lifeExpectancy = BIRD_CONFIG[birdCategory].avgLifespan;
    }
    const remainingMin = Math.max(0, lifeExpectancy.min - year);
    const remainingMax = Math.max(0, lifeExpectancy.max - year);

    // Health tips based on life stage
    const healthTips = getHealthTips(species, lifeStage.key, year);

    setResult({
      humanAge: Math.round(humanAge),
      exactHumanAge: humanAge,
      breakdown,
      formula,
      lifeStage,
      healthTips,
      milestones,
      lifeExpectancy: {
        min: lifeExpectancy.min,
        max: lifeExpectancy.max,
        remaining: { min: remainingMin, max: remainingMax },
      },
    });
  }, [age, ageInYears, species, formulaType, getSubConfig, speciesConfig, birdCategory]);

  // Get life stage
  const getLifeStage = (petAge: number, seniorAge: number): LifeStage => {
    let stageKey: keyof typeof LIFE_STAGES;
    let ageRange: string;

    // Adjust thresholds based on species
    const juniorEnd = species === "hamster" ? 0.25 : species === "horse" ? 2 : 0.5;
    const adultStart = species === "hamster" ? 0.5 : species === "horse" ? 4 : 2;
    const matureStart = seniorAge * 0.7;
    const geriatricStart = seniorAge * 1.3;

    if (petAge < juniorEnd) {
      stageKey = "puppy";
      ageRange = `0 - ${juniorEnd} años`;
    } else if (petAge < adultStart) {
      stageKey = "junior";
      ageRange = `${juniorEnd} - ${adultStart} años`;
    } else if (petAge < matureStart) {
      stageKey = "adult";
      ageRange = `${adultStart} - ${matureStart.toFixed(1)} años`;
    } else if (petAge < seniorAge) {
      stageKey = "mature";
      ageRange = `${matureStart.toFixed(1)} - ${seniorAge} años`;
    } else if (petAge < geriatricStart) {
      stageKey = "senior";
      ageRange = `${seniorAge} - ${geriatricStart.toFixed(1)} años`;
    } else {
      stageKey = "geriatric";
      ageRange = `> ${geriatricStart.toFixed(1)} años`;
    }

    return {
      ...LIFE_STAGES[stageKey],
      ageRange,
    };
  };

  // Generate milestones
  const generateMilestones = (currentAge: number, config: SizeConfig, currentHumanAge: number): Milestone[] => {
    const milestones: Milestone[] = [
      { petAge: 0.5, humanAge: Math.round(config.year1Equiv * 0.5), description: "Equivalente a un niño de 7-8 años", reached: currentAge >= 0.5 },
      { petAge: 1, humanAge: config.year1Equiv, description: "Adolescente (pubertad)", reached: currentAge >= 1 },
      { petAge: 2, humanAge: config.year2Equiv, description: "Adulto joven", reached: currentAge >= 2 },
      { petAge: config.seniorAge * 0.5, humanAge: Math.round(config.year2Equiv + (config.seniorAge * 0.5 - 2) * config.multiplier), description: "Mediana edad", reached: currentAge >= config.seniorAge * 0.5 },
      { petAge: config.seniorAge, humanAge: Math.round(config.year2Equiv + (config.seniorAge - 2) * config.multiplier), description: "Inicio etapa senior", reached: currentAge >= config.seniorAge },
    ];
    return milestones.filter(m => m.petAge > 0);
  };

  // Get health tips
  const getHealthTips = (species: Species, stageKey: string, age: number): string[] => {
    const tips: string[] = [];

    // General tips by stage
    if (stageKey === "puppy" || stageKey === "junior") {
      tips.push("Completar esquema de vacunación");
      tips.push("Socialización temprana con otros animales y personas");
      tips.push("Establecer rutinas de alimentación y ejercicio");
    } else if (stageKey === "adult") {
      tips.push("Mantener peso ideal para prevenir enfermedades");
      tips.push("Limpieza dental regular");
      tips.push("Chequeo anual completo");
    } else if (stageKey === "mature" || stageKey === "senior") {
      tips.push("Análisis de sangre cada 6 meses");
      tips.push("Suplementos para articulaciones si hay rigidez");
      tips.push("Monitorear cambios en apetito y comportamiento");
      tips.push("Considerar dieta específica para seniors");
    } else if (stageKey === "geriatric") {
      tips.push("Visitas veterinarias más frecuentes");
      tips.push("Adaptar el hogar para mayor comodidad");
      tips.push("Monitoreo de signos de dolor o malestar");
      tips.push("Considerar evaluación de calidad de vida");
    }

    // Species-specific tips
    if (species === "dog" && age > 7) {
      tips.push("Revisar función cardíaca y renal");
    } else if (species === "cat" && age > 10) {
      tips.push("Monitorear función tiroidea");
      tips.push("Chequeo de presión arterial");
    } else if (species === "ferret" && age > 3) {
      tips.push("Vigilar signos de insulinoma");
      tips.push("Chequeo adrenal semestral");
    }

    return tips.slice(0, 5);
  };

  // Get icon component
  const getIcon = (name: string): React.ComponentType<{ className?: string }> => {
    const icon = (Icons as Record<string, unknown>)[name];
    return (typeof icon === "function" ? icon : Icons.PawPrint) as React.ComponentType<{ className?: string }>;
  };

  // Handle preset click
  const handlePresetClick = (preset: { value: number; unit: string }) => {
    if (preset.unit === "months") {
      setAgeUnit("months");
      setAge(preset.value.toString());
    } else {
      setAgeUnit("years");
      setAge(preset.value.toString());
    }
  };

  // Reset when species changes
  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    setResult(null);
    setAge("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Icons.Calculator className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black mb-2">
              Calculadora de Edad para Mascotas
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
              Conversión precisa a años humanos basada en investigación científica veterinaria.
            </p>

            {/* Formula toggle for dogs */}
            {species === "dog" && (
              <div className="mt-4 inline-flex items-center bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setFormulaType("classic")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    formulaType === "classic" ? "bg-white text-[var(--primary)]" : "text-white hover:bg-white/10"
                  }`}
                >
                  Clásica
                </button>
                <button
                  onClick={() => setFormulaType("logarithmic")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    formulaType === "logarithmic" ? "bg-white text-[var(--primary)]" : "text-white hover:bg-white/10"
                  }`}
                >
                  Científica 2019
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Step 1: Species Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                1. Tipo de mascota
              </label>
              <span className="text-xs text-gray-400">
                {speciesConfig.avgLifespan.min}-{speciesConfig.avgLifespan.max} años promedio
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {(Object.keys(SPECIES_CONFIG) as Species[]).map((s) => {
                const cfg = SPECIES_CONFIG[s];
                const IconComp = getIcon(cfg.icon);
                return (
                  <button
                    key={s}
                    onClick={() => handleSpeciesChange(s)}
                    className={`relative p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      species === s
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                        : "border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                    title={cfg.label}
                  >
                    <span className="text-lg sm:text-xl">{cfg.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-bold truncate w-full text-center">{cfg.label}</span>
                    {species === s && (
                      <motion.div layoutId="species-check" className="absolute -top-1 -right-1">
                        <Icons.CheckCircle2 className="w-4 h-4 text-[var(--primary)] bg-white rounded-full" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Sub-options */}
          <AnimatePresence mode="wait">
            {species === "dog" && (
              <motion.div
                key="dog-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. Tamaño del perro
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(DOG_SIZE_CONFIG) as DogSize[]).map((size) => {
                    const cfg = DOG_SIZE_CONFIG[size];
                    return (
                      <button
                        key={size}
                        onClick={() => { setDogSize(size); setResult(null); }}
                        className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                          dogSize === size
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="block text-sm font-bold">{cfg.label}</span>
                        <span className={`block text-xs mt-0.5 ${dogSize === size ? "text-white/80" : "text-gray-400"}`}>
                          {cfg.weightRange}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Icons.Info className="w-3 h-3" />
                  {DOG_SIZE_CONFIG[dogSize].description}
                </p>
              </motion.div>
            )}

            {species === "cat" && (
              <motion.div
                key="cat-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. Estilo de vida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CAT_TYPE_CONFIG) as CatType[]).map((type) => {
                    const cfg = CAT_TYPE_CONFIG[type];
                    const icons = { indoor: Icons.Home, outdoor: Icons.Trees, mixed: Icons.ArrowLeftRight };
                    const Icon = icons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => { setCatType(type); setResult(null); }}
                        className={`py-4 px-3 rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${
                          catType === type
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-bold text-sm">{cfg.label}</span>
                        <span className={`text-xs text-center ${catType === type ? "text-white/80" : "text-gray-400"}`}>
                          {cfg.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {species === "bird" && (
              <motion.div
                key="bird-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. Tipo de ave
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(BIRD_CONFIG) as BirdCategory[]).map((cat) => {
                    const cfg = BIRD_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => { setBirdCategory(cat); setResult(null); }}
                        className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                          birdCategory === cat
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="block text-sm font-bold">{cfg.label}</span>
                        <span className={`block text-xs mt-0.5 ${birdCategory === cat ? "text-white/80" : "text-gray-400"}`}>
                          {cfg.avgLifespan.min}-{cfg.avgLifespan.max}a
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {species === "turtle" && (
              <motion.div
                key="turtle-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. Tipo de tortuga
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["aquatic", "terrestrial"] as TurtleType[]).map((type) => {
                    const isAquatic = type === "aquatic";
                    return (
                      <button
                        key={type}
                        onClick={() => { setTurtleType(type); setResult(null); }}
                        className={`py-4 px-4 rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${
                          turtleType === type
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{isAquatic ? "🐢" : "🐢"}</span>
                        <span className="font-bold">{isAquatic ? "Acuática" : "Terrestre"}</span>
                        <span className={`text-xs ${turtleType === type ? "text-white/80" : "text-gray-400"}`}>
                          {isAquatic ? "Orejas rojas, pintadas" : "Sulcata, mediterránea"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {species === "fish" && (
              <motion.div
                key="fish-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  2. Tipo de pez
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["tropical", "goldfish", "koi"] as FishType[]).map((type) => {
                    const labels = { tropical: "Tropical", goldfish: "Pez Dorado", koi: "Koi / Carpa" };
                    const descs = { tropical: "Betta, guppy, tetra", goldfish: "Común, cometa", koi: "Estanque" };
                    return (
                      <button
                        key={type}
                        onClick={() => { setFishType(type); setResult(null); }}
                        className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                          fishType === type
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="block text-sm font-bold">{labels[type]}</span>
                        <span className={`block text-xs mt-0.5 ${fishType === type ? "text-white/80" : "text-gray-400"}`}>
                          {descs[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Age Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {speciesConfig.hasSubOptions ? "3" : "2"}. Edad de tu {speciesConfig.label.toLowerCase()}
            </label>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {agePresets.map((preset, i) => {
                const isActive = ageUnit === (preset.unit === "months" ? "months" : "years") && parseFloat(age) === preset.value;
                return (
                  <button
                    key={i}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {preset.unit === "months" ? `${preset.value}m` : `${preset.value}a`}
                  </button>
                );
              })}
            </div>

            {/* Age input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="0"
                  className="w-full text-3xl sm:text-4xl font-black p-4 pr-20 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 text-center outline-none transition-all"
                  min="0"
                  max="200"
                  step="0.1"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setAgeUnit("years")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      ageUnit === "years" ? "bg-white shadow text-[var(--primary)]" : "text-gray-500"
                    }`}
                  >
                    Años
                  </button>
                  <button
                    onClick={() => setAgeUnit("months")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      ageUnit === "months" ? "bg-white shadow text-[var(--primary)]" : "text-gray-500"
                    }`}
                  >
                    Meses
                  </button>
                </div>
              </div>
              <button
                onClick={calculateAge}
                disabled={!age || parseFloat(age) <= 0}
                className="bg-[var(--primary)] text-white font-bold px-6 sm:px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                <Icons.Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">Calcular</span>
              </button>
            </div>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border-t-2 border-dashed border-gray-200 pt-6 space-y-6"
              >
                {/* Main Result */}
                <div className="text-center">
                  <p className="text-[var(--text-muted)] font-medium mb-2">
                    Tu {speciesConfig.label.toLowerCase()} de {ageInYears.toFixed(1)} años equivale a:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl sm:text-8xl font-black text-[var(--primary)]">
                      {result.humanAge}
                    </span>
                    <div className="text-left">
                      <span className="block text-xl text-gray-400 font-bold">años</span>
                      <span className="block text-sm text-gray-400">humanos</span>
                    </div>
                  </div>

                  {/* Life Stage Badge */}
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border mt-4 ${result.lifeStage.color}`}>
                    {(() => {
                      const Icon = getIcon(result.lifeStage.icon);
                      return <Icon className="w-5 h-5" />;
                    })()}
                    {result.lifeStage.label}
                    <span className="text-xs opacity-70">({result.lifeStage.ageRange})</span>
                  </div>

                  {/* Life expectancy bar */}
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>0 años</span>
                      <span>Esperanza: {result.lifeExpectancy.min}-{result.lifeExpectancy.max} años</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (ageInYears / result.lifeExpectancy.max) * 100)}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-1 bg-[var(--primary)] rounded-full shadow-md"
                        style={{ left: `${Math.min(98, (ageInYears / result.lifeExpectancy.max) * 100)}%` }}
                      />
                    </div>
                    {result.lifeExpectancy.remaining.max > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expectativa restante: {result.lifeExpectancy.remaining.min.toFixed(1)} - {result.lifeExpectancy.remaining.max.toFixed(1)} años
                      </p>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  {[
                    { key: "result", label: "Cálculo", icon: "Calculator" },
                    { key: "health", label: "Salud", icon: "Heart" },
                    { key: "milestones", label: "Hitos", icon: "Flag" },
                  ].map((tab) => {
                    const Icon = getIcon(tab.icon);
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                          activeTab === tab.key
                            ? "border-[var(--primary)] text-[var(--primary)]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === "result" && (
                    <motion.div
                      key="result-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={() => setShowMethodology(!showMethodology)}
                        className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icons.BookOpen className="w-5 h-5 text-[var(--primary)]" />
                            <span className="font-bold text-gray-700">Metodología de cálculo</span>
                          </div>
                          <Icons.ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMethodology ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {showMethodology && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Fórmula aplicada</p>
                                <code className="block bg-gray-50 px-4 py-2 rounded-lg text-sm text-[var(--primary)] font-mono">
                                  {result.formula}
                                </code>
                              </div>

                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pasos del cálculo</p>
                                <div className="space-y-2">
                                  {result.breakdown.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                      <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
                                        {i + 1}
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-gray-600">{step.description}</p>
                                        <p className="font-mono text-gray-400 text-xs">{step.calculation} {step.result}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-400">
                                  <strong>Fuentes:</strong> {speciesConfig.sources.join(", ")}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {activeTab === "health" && (
                    <motion.div
                      key="health-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Life stage info */}
                      <div className="bg-[var(--bg-subtle)] rounded-xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Icons.Stethoscope className="w-5 h-5 text-[var(--primary)]" />
                          Etapa: {result.lifeStage.label}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">{result.lifeStage.description}</p>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Chequeos</p>
                            <p className="text-sm text-gray-700">{result.lifeStage.checkupFrequency}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Dieta</p>
                            <p className="text-sm text-gray-700">{result.lifeStage.dietTips}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ejercicio</p>
                            <p className="text-sm text-gray-700">{result.lifeStage.exerciseTips}</p>
                          </div>
                        </div>
                      </div>

                      {/* Health tips */}
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Icons.Lightbulb className="w-5 h-5 text-amber-500" />
                          Recomendaciones específicas
                        </h4>
                        <ul className="space-y-2">
                          {result.healthTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                              <Icons.CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-xl p-5 border border-[var(--primary)]/20">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-gray-800">¿Necesita un chequeo?</p>
                            <p className="text-sm text-gray-600">Agenda una consulta veterinaria</p>
                          </div>
                          <Link
                            href={`https://wa.me/${config.contact.whatsapp_number}?text=${encodeURIComponent(
                              `Hola, tengo un ${speciesConfig.label.toLowerCase()} de ${ageInYears.toFixed(1)} años (${result.humanAge} años humanos) en etapa ${result.lifeStage.label}. Me gustaría agendar un chequeo.`
                            )}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                          >
                            <Icons.MessageCircle className="w-5 h-5" />
                            Agendar cita
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "milestones" && (
                    <motion.div
                      key="milestones-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-3">
                        {result.milestones.map((milestone, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              milestone.reached
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              milestone.reached ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                            }`}>
                              {milestone.reached ? (
                                <Icons.Check className="w-5 h-5" />
                              ) : (
                                <Icons.Clock className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">
                                {milestone.petAge} {milestone.petAge === 1 ? "año" : "años"} = {milestone.humanAge} años humanos
                              </p>
                              <p className="text-sm text-gray-500">{milestone.description}</p>
                            </div>
                            {milestone.reached && Math.abs(milestone.petAge - ageInYears) < 0.5 && (
                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Actual
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Icons.Info className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-600">Nota importante</p>
              <p>
                Esta calculadora proporciona una estimación basada en promedios científicos. La edad biológica real
                puede variar según genética, dieta, cuidados y condiciones de salud individuales. Consulta siempre
                con un veterinario para una evaluación precisa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
