import { z } from 'zod';

export const Locale = z.enum(['en', 'es', 'pt']);

export type LocaleType = z.infer<typeof Locale>;

export interface Translation {
  locale: LocaleType;
  text: string;
}

export const TranslationSchema = z.object({
  locale: Locale,
  text: z.string(),
});

export type TranslationType = z.infer<typeof TranslationSchema>;