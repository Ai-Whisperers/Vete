import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

interface AdoptionApplicationFormProps {
  petId: number;
}

const AdoptionApplicationForm: React.FC<AdoptionApplicationFormProps> = ({ petId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert([
          {
            pet_id: petId,
            name,
            email,
            phone,
            address,
            document: document ? await uploadDocument(document) : null,
          },
        ]);

      if (error) {
        setStatus('Error submitting application');
      } else {
        setStatus('Application submitted successfully');
        router.push('/adoption-application-submitted');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error submitting application');
    }
  };

  const uploadDocument = async (document: File) => {
    const { data, error } = await supabase.storage
      .from('adoption-applications')
      .upload(document.name, document, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return data.Key;
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocument(event.target.files ? event.target.files[0] : null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email:
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Phone:
        <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label>
        Address:
        <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <label>
        Document:
        <input type="file" onChange={handleDocumentChange} />
      </label>
      <button type="submit">Submit Application</button>
      <p>{status}</p>
    </form>
  );
};

export default AdoptionApplicationForm;