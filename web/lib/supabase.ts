import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.com';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

export const supabaseClient = createClient(supabaseUrl, supabaseKey, supabaseSecret);