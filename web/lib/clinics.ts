
import fs from 'node:fs';
import path from 'node:path';
import merge from 'lodash.merge';

// Define the shape of our data based on the JSON files
export interface ClinicTheme {
  colors: {
    primary: { main: string; light: string; dark: string; contrast: string };
    secondary: { main: string; light: string; dark: string; contrast: string };
    background: { default: string; paper: string; subtle: string; dark: string };
    text: { primary: string; secondary: string; muted: string; invert: string };
    status: { success: string; warning: string; error: string };
  };
  gradients: {
    hero: string;
    primary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  ui: {
    border_radius: string;
    shadow_sm: string;
    shadow_md: string;
    shadow_lg: string;
  };
}

export interface ClinicConfig {
  id: string;
  name: string;
  tagline?: string;
  contact: {
    whatsapp_number: string;
    phone_display: string;
    email: string;
    address: string;
    google_maps_id: string;
  };
  settings: {
    currency: string;
    emergency_24h: boolean;
    modules: {
      toxic_checker: boolean;
      age_calculator: boolean;
    };
  };
  ui_labels: {
    nav?: any;
    footer?: any;
    home?: any;
    services?: any;
    about?: any;
    portal?: any;
    common?: any;
    store?: {
      product_card?: {
        add?: string;
        added?: string;
      };
      [key: string]: any;
    };
    [key: string]: any; // Allow flexibility
  };
  branding?: {
    logo_url?: string;
    logo_dark_url?: string;
    logo_width?: number;
    logo_height?: number;
    favicon_url?: string;
    hero_image_url?: string;
    og_image_url?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  stats?: {
    pets_served?: string;
    years_experience?: string;
    emergency_hours?: string;
    rating?: string;
  };
  hours?: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
}

export interface ClinicImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ClinicImages {
  version: string;
  basePath: string;
  images: {
    hero?: Record<string, ClinicImage>;
    team?: Record<string, ClinicImage>;
    facilities?: Record<string, ClinicImage>;
    services?: Record<string, ClinicImage>;
    features?: Record<string, ClinicImage>;
    store?: Record<string, ClinicImage>;
    tools?: Record<string, ClinicImage>;
    patterns?: Record<string, ClinicImage>;
    branding?: Record<string, ClinicImage>;
    brands?: Record<string, ClinicImage>;
    [category: string]: Record<string, ClinicImage> | string | undefined;
  };
  placeholders?: {
    pet?: string;
    product?: string;
    team?: string;
    service?: string;
  };
}

export interface ClinicData {
  config: ClinicConfig;
  theme: ClinicTheme;
  images?: ClinicImages;
  home: any; // Typing these specifically would be better, but 'any' allows flexibility for now
  services: any;
  about: any;
  testimonials?: any;
  faq?: any;
  legal?: any;
}

const CONTENT_DIR = path.join(process.cwd(), '.content_data');

export async function getClinicData(slug: string): Promise<ClinicData | null> {
  const clinicDir = path.join(CONTENT_DIR, slug);

  // Check if clinic exists
  if (!fs.existsSync(clinicDir)) {
    return null;
  }

  // Helper to read JSON
  const readJson = (file: string) => {
    const filePath = path.join(clinicDir, file);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents);
    }
    return null;
  };

  const config = readJson('config.json');
  const theme = readJson('theme.json');
  const images = readJson('images.json');
  const home = readJson('home.json');
  const services = readJson('services.json');
  const about = readJson('about.json');
  const testimonials = readJson('testimonials.json');
  const faq = readJson('faq.json');
  const legal = readJson('legal.json');

  // Load global UI labels
  const globalUiLabelsPath = path.join(CONTENT_DIR, 'ui_labels.json');
  let ui_labels = {};
  if (fs.existsSync(globalUiLabelsPath)) {
    ui_labels = JSON.parse(fs.readFileSync(globalUiLabelsPath, 'utf8'));
  }

  if (!config || !theme) {
    return null; // Essential data missing
  }

  // Allow clinic specific override (deep merge)
  if (config.ui_labels) {
      merge(ui_labels, config.ui_labels);
  }
  
  // Ensure config has the merged ui_labels
  config.ui_labels = ui_labels;

  return {
    config,
    theme,
    images,
    home,
    services,
    about,
    testimonials,
    faq,
    legal
  };
}

export async function getAllClinics(): Promise<string[]> {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs.readdirSync(CONTENT_DIR).filter(file => {
        // Exclude template folders (prefixed with _ or .), hidden files, and non-directories
        if (file.startsWith('_') || file.startsWith('.')) return false;
        const fullPath = path.join(CONTENT_DIR, file);
        if (!fs.statSync(fullPath).isDirectory()) return false;
        // Also verify it has required config files to be a valid clinic
        const configPath = path.join(fullPath, 'config.json');
        const themePath = path.join(fullPath, 'theme.json');
        return fs.existsSync(configPath) && fs.existsSync(themePath);
    });
}

/**
 * Get the full URL for a clinic image
 * @param images - The clinic images manifest
 * @param category - Image category (e.g., 'hero', 'team', 'services')
 * @param key - Image key within the category
 * @returns Full URL path or null if not found
 */
export function getClinicImageUrl(
  images: ClinicImages | undefined,
  category: string,
  key: string
): string | null {
  if (!images?.images?.[category]?.[key]) {
    return null;
  }

  const image = images.images[category][key] as ClinicImage;
  return `${images.basePath}/${image.src}`;
}

/**
 * Get full image data for a clinic image
 * @param images - The clinic images manifest
 * @param category - Image category (e.g., 'hero', 'team', 'services')
 * @param key - Image key within the category
 * @returns Image data with full URL or null if not found
 */
export function getClinicImage(
  images: ClinicImages | undefined,
  category: string,
  key: string
): (ClinicImage & { url: string }) | null {
  if (!images?.images?.[category]?.[key]) {
    return null;
  }

  const image = images.images[category][key] as ClinicImage;
  return {
    ...image,
    url: `${images.basePath}/${image.src}`
  };
}

/**
 * Get all images in a category
 * @param images - The clinic images manifest
 * @param category - Image category (e.g., 'hero', 'team', 'services')
 * @returns Array of images with full URLs
 */
export function getClinicImagesByCategory(
  images: ClinicImages | undefined,
  category: string
): Array<ClinicImage & { key: string; url: string }> {
  if (!images?.images?.[category]) {
    return [];
  }

  const categoryImages = images.images[category] as Record<string, ClinicImage>;
  return Object.entries(categoryImages).map(([key, image]) => ({
    key,
    ...image,
    url: `${images.basePath}/${image.src}`
  }));
}

/**
 * Get placeholder image URL
 * @param images - The clinic images manifest
 * @param type - Placeholder type (e.g., 'pet', 'product', 'team')
 * @returns Placeholder URL or default
 */
export function getPlaceholderUrl(
  images: ClinicImages | undefined,
  type: 'pet' | 'product' | 'team' | 'service'
): string {
  if (images?.placeholders?.[type]) {
    return images.placeholders[type] as string;
  }

  // Default placeholders
  const defaults: Record<string, string> = {
    pet: '/images/placeholders/pet-placeholder.jpg',
    product: '/images/placeholders/product-placeholder.jpg',
    team: '/images/placeholders/team-placeholder.jpg',
    service: '/images/placeholders/service-placeholder.jpg'
  };

  return defaults[type] || '/images/placeholders/default.jpg';
}
