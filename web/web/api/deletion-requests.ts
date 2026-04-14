```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';

const deletionRequests = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { user_id } = req.body;

    const { data, error } = await supabase
      .from('deletion_requests')
      .insert([{ user_id }]);

    if (error) {
      return res.status(500).json({ message: 'Error sending deletion request' });
    }

    res.status(201).json({ message: 'Deletion request sent' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default deletionRequests;
```


