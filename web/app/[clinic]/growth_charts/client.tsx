"use client";
import { useEffect, useState } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface GrowthChart {
  id: string;
  breed: string;
  age_months: number;
  weight_kg: number;
}

export default function GrowthChartsClient() {
  const { user, loading } = useAuthRedirect();
  const [charts, setCharts] = useState<GrowthChart[]>([]);
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newWeight, setNewWeight] = useState('');

  const fetchCharts = async () => {
    const res = await fetch('/api/growth_charts');
    if (res.ok) {
      const data = await res.json();
      setCharts(data);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchCharts();
    }
  }, [loading, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { breed: newBreed, age_months: Number(newAge), weight_kg: Number(newWeight) };
    const res = await fetch('/api/growth_charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewBreed('');
      setNewAge('');
      setNewWeight('');
      fetchCharts();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/growth_charts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchCharts();
  };

  const handleEdit = async (id: string) => {
    const breed = prompt('New breed');
    const age = prompt('New age (months)');
    const weight = prompt('New weight (kg)');
    if (breed && age && weight) {
      await fetch('/api/growth_charts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, breed, age_months: Number(age), weight_kg: Number(weight) }),
      });
      fetchCharts();
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Growth Charts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Breed</th>
              <th className="p-2 border">Age (months)</th>
              <th className="p-2 border">Weight (kg)</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {charts.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.breed}</td>
                <td className="p-2 border">{c.age_months}</td>
                <td className="p-2 border">{c.weight_kg}</td>
                <td className="p-2 border space-x-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(c.id)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 max-w-md">
          <input className="border p-2" placeholder="Breed" value={newBreed} onChange={(e) => setNewBreed(e.target.value)} required />
          <input type="number" className="border p-2" placeholder="Age (months)" value={newAge} onChange={(e) => setNewAge(e.target.value)} required />
          <input type="number" className="border p-2" placeholder="Weight (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} required />
          <button type="submit" className="bg-green-600 text-white p-2 rounded">Add Growth Chart</button>
        </form>
      </div>
    </div>
  );
}
