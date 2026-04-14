import type { SupabaseClient } from '@supabase/supabase-js';
import { TranslationSchema } from './types';

export class LocaleRepository {
  constructor(private supabase: SupabaseClient) {}

  async getTranslations(locale: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('id, text')
      .eq('locale', locale);

    if (error) {
      throw error;
    }

    return data;
  }

  async addTranslation(translation: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('translations')
      .insert([translation]);

    if (error) {
      throw error;
    }

    return data[0];
  }
}