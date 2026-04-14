import type { SupabaseClient } from '@supabase/supabase-js';
import { LocaleRepository } from './repository';
import { TranslationSchema } from './types';

export class LocaleService {
  private repository: LocaleRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new LocaleRepository(supabase);
  }

  async getTranslations(locale: string): Promise<any[]> {
    return this.repository.getTranslations(locale);
  }

  async addTranslation(translation: any): Promise<any> {
    const result = TranslationSchema.safeParse(translation);
    if (!result.success) {
      throw result.error;
    }

    return this.repository.addTranslation(translation);
  }
}