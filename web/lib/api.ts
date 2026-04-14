import { NextApiRequest, NextApiResponse } from 'next';
import { SWRConfig } from 'swr';
import { supabaseClient } from '../lib/supabase';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'GET') {
    const { url } = req;
    const cacheKey = `api:${url}`;
    const cachedResponse = await supabaseClient.from('cache').select('*').eq('key', cacheKey);

    if (cachedResponse.data && cachedResponse.data.length > 0) {
      const cachedData = cachedResponse.data[0];
      const maxAge = 60 * 60 * 24; // 1 day
      const age = Date.now() - cachedData.created_at;

      if (age < maxAge) {
        return res.status(200).json(cachedData.data);
      }
    }

    const response = await fetcher(url);
    await supabaseClient.from('cache').insert([{ key: cacheKey, data: response }]);

    return res.status(200).json(response);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default api;