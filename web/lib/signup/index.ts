/**
 * Signup Module - Public exports
 */

// Types
export * from './types'

// Validation schemas
export {
  slugSchema,
  rucSchema,
  phoneDisplaySchema,
  whatsappSchema,
  passwordSchema,
  hexColorSchema,
  tenantInfoSchema,
  contactSchema,
  adminAccountSchema,
  brandingSchema,
  signupRequestSchema,
  checkSlugSchema,
  validateStep,
  generateSlugFromName,
  generateSlugSuggestion,
} from './schema'

// Color utilities
export {
  hexToRgb,
  rgbToHex,
  rgbToString,
  rgbToHsl,
  hslToRgb,
  adjustLightness,
  adjustSaturation,
  getContrastColor,
  generateColorScale,
  generateColorScaleFromMain,
  generateInteractiveColors,
  generateInputColors,
  generateGradients,
  generateShadows,
  isValidHexColor,
  normalizeHexColor,
} from './color-utils'

// Content generation
export {
  generateConfig,
  generateTheme,
  generateHome,
  generateAbout,
  generateLegal,
  generateAllContent,
  deleteClinicContent,
  tenantContentExists,
} from './content-generator'
