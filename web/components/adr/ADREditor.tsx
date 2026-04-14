import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ADR {
  id: number;
  title: string;
  description: string;
  decision: string;
}

const ADREditor = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [decision, setDecision] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('adrs')
      .insert([{ title, description, decision }]);
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label>
        Decision:
        <input type="text" value={decision} onChange={(event) => setDecision(event.target.value)} />
      </label>
      <button type="submit">Create ADR</button>
    </form>
  );
};

export default ADREditor;