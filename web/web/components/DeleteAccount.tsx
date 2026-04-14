```typescript
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

const DeleteAccount = () => {
  const [deletionRequestSent, setDeletionRequestSent] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('deletion_requests')
        .insert([{ user_id: supabase.auth.user().id }]);

      if (error) {
        throw error;
      }

      setDeletionRequestSent(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      {deletionRequestSent ? (
        <p>Deletion request sent. Please wait for the grace period to end.</p>
      ) : (
        <button onClick={handleDeleteAccount}>Delete Account</button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DeleteAccount;
```


