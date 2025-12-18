/**
 * Pet Size Classification Utility
 *
 * Classifies pets into size categories based on weight for dynamic service pricing.
 */

export type PetSizeCategory = 'mini' | 'pequeño' | 'mediano' | 'grande' | 'gigante';

/**
 * Weight ranges for each size category (in kg)
 */
export const SIZE_WEIGHT_RANGES: Record<PetSizeCategory, { min: number; max: number }> = {
  mini: { min: 0, max: 5 },
  pequeño: { min: 5, max: 10 },
  mediano: { min: 10, max: 25 },
  grande: { min: 25, max: 40 },
  gigante: { min: 40, max: Infinity }
};

/**
 * Human-readable labels for each size category (Spanish)
 */
export const SIZE_LABELS: Record<PetSizeCategory, string> = {
  mini: 'Mini (0-5 kg)',
  pequeño: 'Pequeño (5-10 kg)',
  mediano: 'Mediano (10-25 kg)',
  grande: 'Grande (25-40 kg)',
  gigante: 'Gigante (40+ kg)'
};

/**
 * Short labels for badges/chips
 */
export const SIZE_SHORT_LABELS: Record<PetSizeCategory, string> = {
  mini: 'Mini',
  pequeño: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande',
  gigante: 'Gigante'
};

/**
 * Default size multipliers for services (can be overridden per service)
 */
export const DEFAULT_SIZE_MULTIPLIERS: Record<PetSizeCategory, number> = {
  mini: 0.8,
  pequeño: 1.0,
  mediano: 1.3,
  grande: 1.5,
  gigante: 1.8
};

/**
 * Classifies a pet into a size category based on weight
 * @param weightKg - Pet weight in kilograms
 * @returns Size category, defaults to 'mediano' if weight is null/undefined
 */
export function classifyPetSize(weightKg: number | null | undefined): PetSizeCategory {
  if (weightKg === null || weightKg === undefined) {
    return 'mediano'; // Default for unknown weight
  }

  if (weightKg <= 5) return 'mini';
  if (weightKg <= 10) return 'pequeño';
  if (weightKg <= 25) return 'mediano';
  if (weightKg <= 40) return 'grande';
  return 'gigante';
}

/**
 * Calculates the final price for a service based on pet size
 * @param basePrice - Base price of the service variant
 * @param sizeDependent - Whether this variant uses size-based pricing
 * @param sizeMultipliers - Custom multipliers for this variant (optional)
 * @param petSize - The pet's size category
 * @returns Calculated price (rounded to nearest integer)
 */
export function calculateServicePrice(
  basePrice: number,
  sizeDependent: boolean,
  sizeMultipliers: Record<PetSizeCategory, number> | undefined | null,
  petSize: PetSizeCategory
): number {
  if (!sizeDependent) {
    return basePrice;
  }

  const multipliers = sizeMultipliers ?? DEFAULT_SIZE_MULTIPLIERS;
  const multiplier = multipliers[petSize] ?? 1.0;

  return Math.round(basePrice * multiplier);
}

/**
 * Formats a price for display in Paraguayan Guaraníes
 * @param price - Price in guaraníes
 * @returns Formatted string (e.g., "150.000 Gs")
 */
export function formatPriceGs(price: number): string {
  return `${price.toLocaleString('es-PY')} Gs`;
}

/**
 * Gets the color class for a size badge
 * @param size - Pet size category
 * @returns Tailwind color classes for the badge
 */
export function getSizeBadgeColor(size: PetSizeCategory): string {
  const colors: Record<PetSizeCategory, string> = {
    mini: 'bg-pink-100 text-pink-700',
    pequeño: 'bg-blue-100 text-blue-700',
    mediano: 'bg-green-100 text-green-700',
    grande: 'bg-orange-100 text-orange-700',
    gigante: 'bg-purple-100 text-purple-700'
  };
  return colors[size];
}
