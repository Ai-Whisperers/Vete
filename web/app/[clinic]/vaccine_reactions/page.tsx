"use client";

import { useEffect, useState } from 'react';

interface VaccineReaction {
  id: string;
  vaccine_id: string;
  reaction_detail: string;
  occurred_at: string; // ISO date
}

export default function VaccineReactionsPage() {
  const [reactions, setReactions] = useState<VaccineReaction[]>([]);
  const [newVaccineId, setNewVaccineId] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newDate, setNewDate] = useState('');

  const fetchReactions = async () => {
    const res = await fetch('/api/vaccine_reactions');
    if (res.ok) {
      const data = await res.json();
      setReactions(data);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      vaccine_id: newVaccineId,
      reaction_detail: newDetail,
      occurred_at: newDate,
    };
    const res = await fetch('/api/vaccine_reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewVaccineId('');
      setNewDetail('');
      setNewDate('');
      fetchReactions();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/vaccine_reactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReactions();
  };

  const handleEdit = async (id: string) => {
    const vaccine_id = prompt('New vaccine ID');
    const reaction_detail = prompt('New reaction detail');
    const occurred_at = prompt('New date (YYYY-MM-DD)');
    if (vaccine_id && reaction_detail && occurred_at) {
      await fetch('/api/vaccine_reactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, vaccine_id, reaction_detail, occurred_at }),
      });
      fetchReactions();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vaccine Reactions</h1>
      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Vaccine ID</th>
            <th className="p-2 border">Detail</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reactions.map((r) => (
            <tr key={r.id}>
              <td className="p-2 border">{r.vaccine_id}</td>
              <td className="p-2 border">{r.reaction_detail}</td>
              <td className="p-2 border">{r.occurred_at?.split('T')[0]}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(r.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(r.id)}
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
          placeholder="Vaccine ID"
          value={newVaccineId}
          onChange={(e) => setNewVaccineId(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder="Reaction Detail"
          value={newDetail}
          onChange={(e) => setNewDetail(e.target.value)}
          required
        />
        <input
          type="date"
          className="border p-2"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Add Reaction
        </button>
      </form>
    </div>
  );
}
