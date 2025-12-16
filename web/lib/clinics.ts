
import fs from 'fs';
import path from 'path';

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
  ui_labels?: {
    nav: {
      home: string;
      services: string;
      about: string;
      book_btn: string;
    };
    footer: {
      rights: string;
    };
    home: {
      visit_us: string;
    };
    services: {
      online_badge: string;
      description_label: string;
      includes_label: string;
      table_variant: string;
      table_price: string;
      book_floating_btn: string;
    };
    about: {
      team_title: string;
    };
  };
  branding?: {
    logo_url?: string;
    logo_width?: number;
    logo_height?: number;
    favicon_url?: string;
    hero_image_url?: string;
    og_image_url?: string;
  };
}

export interface ClinicData {
  config: ClinicConfig;
  theme: ClinicTheme;
  home: any; // Typing these specifically would be better, but 'any' allows flexibility for now
  services: any;
  about: any;
  testimonials?: any;
  faq?: any;
  legal?: any;
}

const CONTENT_DIR = path.join(process.cwd(), 'content_data');

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
  const home = readJson('home.json');
  const services = readJson('services.json');
  const about = readJson('about.json');
  const testimonials = readJson('testimonials.json');
  const faq = readJson('faq.json');
  const legal = readJson('legal.json');

  if (!config || !theme) {
    return null; // Essential data missing
  }

  return {
    config,
    theme,
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
        return fs.statSync(path.join(CONTENT_DIR, file)).isDirectory();
    });
}
