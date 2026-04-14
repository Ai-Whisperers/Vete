import { z } from 'zod';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export const ThemeSchema = z.enum(Theme);

export interface Branding {
  id: string;
  clinic_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme: Theme;
  favicon_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export const BrandingSchema = z.object({
  id: z.string(),
  clinic_id: z.string(),
  logo_url: z.string().nullable(),
  primary_color: z.string(),
  secondary_color: z.string(),
  theme: ThemeSchema,
  favicon_url: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});