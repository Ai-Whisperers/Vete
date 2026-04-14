```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';

const deleteUserDate = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { user_id } = req.body;

    try {
      await supabase.deleteUserData(user_id);
      res.status(200).json({ message: 'User data deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default deleteUserDate;
```


