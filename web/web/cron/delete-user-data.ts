```typescript
import { supabase } from '../utils/supabase';

const deleteUserDate = async () => {
  const { data, error } = await supabase
    .from('deletion_requests')
    .select('user_id')
    .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago

  if (error) {
    console.error(error);
    return;
  }

  for (const request of data) {
    try {
      await supabase.deleteUserData(request.user_id);
      await supabase
        .from('deletion_requests')
        .delete()
        .eq('user_id', request.user_id);
    } catch (error) {
      console.error(error);
    }
  }
};

export default deleteUserDate;
```

