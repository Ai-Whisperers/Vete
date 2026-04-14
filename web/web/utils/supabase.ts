```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

export const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export const getDeletionRequest = async (userId: number) => {
  const { data, error } = await supabase
    .from('deletion_requests')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data;
};

export const deleteUserData = async (userId: number) => {
  // Cascade deletion logic
  await supabase.from('pets').delete().eq('user_id', userId);
  await supabase.from('appointments').delete().eq('user_id', userId);
  // Add more tables to delete from here

  await supabase.from('users').delete().eq('id', userId);
};
```


