import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';

interface PetDocument {
  id: number;
  pet_id: number;
  document: string;
  created_at: string;
}

const PetDocuments = () => {
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [newDocument, setNewDocument] = useState('');
  const session = useSession();

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) return;

    const file = event.target.files[0];
    const { data, error } = await supabase.storage
      .from('pet-documents')
      .upload(`${session.user.id}/${file.name}`, file, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    const newDocument: PetDocument = {
      id: data.id,
      pet_id: session.user.id,
      document: data.publicUrl,
      created_at: new Date().toISOString(),
    };

    setDocuments((prevDocuments) => [...prevDocuments, newDocument]);
  };

  const handleRemoveDocument = async (documentId: number) => {
    if (!session) return;

    const { error } = await supabase.storage
      .from('pet-documents')
      .remove(`${session.user.id}/${documentId}`);

    if (error) {
      console.error(error);
      return;
    }

    setDocuments((prevDocuments) =>
      prevDocuments.filter((document) => document.id !== documentId)
    );
  };

  return (
    <div>
      <h2>Pet Documents</h2>
      <input type="file" onChange={handleUploadDocument} />
      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <a href={document.document} target="_blank" rel="noreferrer">
              {document.document}
            </a>
            <button onClick={() => handleRemoveDocument(document.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PetDocuments;