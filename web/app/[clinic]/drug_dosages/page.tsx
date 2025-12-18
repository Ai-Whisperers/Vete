"use client";
import { useEffect, useState } from 'react';

interface DrugDosage {
  id: string;
  drug_name: string;
  dosage_per_kg: number;
  unit: string;
}

export default function DrugDosagesPage() {
  const [dosages, setDosages] = useState<DrugDosage[]>([]);
  const [newDrug, setNewDrug] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newUnit, setNewUnit] = useState('');


  const fetchDosages = async () => {
    const res = await fetch('/api/drug_dosages');
    if (res.ok) {
      const data = await res.json();
      setDosages(data);
    }
  };

  useEffect(() => {
    fetchDosages();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      drug_name: newDrug,
      dosage_per_kg: Number(newDosage),
      unit: newUnit,
    };
    const res = await fetch('/api/drug_dosages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewDrug('');
      setNewDosage('');
      setNewUnit('');
      fetchDosages();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/drug_dosages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchDosages();
  };

  const handleEdit = async (id: string) => {
    const drug_name = prompt('New drug name');
    const dosage = prompt('New dosage per kg');
    const unit = prompt('New unit');
    if (drug_name && dosage && unit) {
      await fetch('/api/drug_dosages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, drug_name, dosage_per_kg: Number(dosage), unit }),
      });
      fetchDosages();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Drug Dosages</h1>
      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Drug Name</th>
            <th className="p-2 border">Dosage per kg</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dosages.map((d) => (
            <tr key={d.id}>
              <td className="p-2 border">{d.drug_name}</td>
              <td className="p-2 border">{d.dosage_per_kg}</td>
              <td className="p-2 border">{d.unit}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(d.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(d.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 max-w-md">
        <input
          className="border p-2"
          placeholder="Drug Name"
          value={newDrug}
          onChange={(e) => setNewDrug(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder="Dosage per kg"
          value={newDosage}
          onChange={(e) => setNewDosage(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder="Unit"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Add Drug Dosage
        </button>
      </form>
    </div>
  );
}
