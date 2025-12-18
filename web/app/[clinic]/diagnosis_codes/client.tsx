"use client";
import { useEffect, useState } from 'react';




interface DiagnosisCode {
  code: string;
  description: string;
  category?: string;
}

export default function DiagnosisCodesClient() {
  const [codes, setCodes] = useState<DiagnosisCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('');


  const fetchCodes = async () => {
    const res = await fetch('/api/diagnosis_codes');
    if (res.ok) {
      const data = await res.json();
      setCodes(data);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code: newCode, description: newDesc, category: newCat };
    const res = await fetch('/api/diagnosis_codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewCode('');
      setNewDesc('');
      setNewCat('');
      fetchCodes();
    }
  };

  const handleDelete = async (code: string) => {
    await fetch('/api/diagnosis_codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: code }),
    });
    fetchCodes();
  };

  const handleEdit = async (code: string) => {
    const description = prompt('New description');
    const category = prompt('New category');
    if (description !== null) {
      await fetch('/api/diagnosis_codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: code, description, category }),
      });
      fetchCodes();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnosis Codes</h1>
      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Code</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.code}>
              <td className="p-2 border">{c.code}</td>
              <td className="p-2 border">{c.description}</td>
              <td className="p-2 border">{c.category}</td>
              <td className="p-2 border space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(c.code)}>
                  Edit
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(c.code)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 max-w-md">
        <input className="border p-2" placeholder="Code" value={newCode} onChange={(e) => setNewCode(e.target.value)} required />
        <input className="border p-2" placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required />
        <input className="border p-2" placeholder="Category (optional)" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">Add Diagnosis Code</button>
      </form>
    </div>
  );
}
