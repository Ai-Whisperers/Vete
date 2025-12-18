"use client";
import { useEffect, useState } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface Prescription {
  id: string;
  drug_name: string;
  dosage: string;
  instructions?: string;
}

export default function PrescriptionsClient() {
  const { user, loading } = useAuthRedirect();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newDrug, setNewDrug] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const fetchPrescriptions = async () => {
    const res = await fetch('/api/prescriptions');
    if (res.ok) {
      const data = await res.json();
      setPrescriptions(data);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPrescriptions();
    }
  }, [loading, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { drug_name: newDrug, dosage: newDosage, instructions: newInstructions };
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewDrug('');
      setNewDosage('');
      setNewInstructions('');
      fetchPrescriptions();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/prescriptions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPrescriptions();
  };

  const handleEdit = async (id: string) => {
    const drug_name = prompt('New drug name');
    const dosage = prompt('New dosage');
    const instructions = prompt('New instructions (optional)');
    if (drug_name && dosage) {
      await fetch('/api/prescriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, drug_name, dosage, instructions }),
      });
      fetchPrescriptions();
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prescriptions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Drug Name</th>
              <th className="p-2 border">Dosage</th>
              <th className="p-2 border">Instructions</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.drug_name}</td>
                <td className="p-2 border">{p.dosage}</td>
                <td className="p-2 border">{p.instructions}</td>
                <td className="p-2 border space-x-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(p.id)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 max-w-md">
          <input className="border p-2" placeholder="Drug Name" value={newDrug} onChange={(e) => setNewDrug(e.target.value)} required />
          <input className="border p-2" placeholder="Dosage" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} required />
          <input className="border p-2" placeholder="Instructions" value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} />
          <button type="submit" className="bg-green-600 text-white p-2 rounded">Add Prescription</button>
        </form>
      </div>
    </div>
  );
}
