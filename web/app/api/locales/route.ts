import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LocaleService } from '@/lib/domain/locales/service';

export async function getTranslations(req: NextApiRequest, res: NextApiResponse) {
  const supabase = await createClient();
  const localeService = new LocaleService(supabase);

  const locale = req.query.locale as string;
  const translations = await localeService.getTranslations(locale);

  return res.status(200).json(translations);
}