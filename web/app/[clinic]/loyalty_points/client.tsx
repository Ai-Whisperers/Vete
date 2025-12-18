"use client";

import { useEffect, useState } from 'react';

interface LoyaltyPoint {
  id: string;
  profile_id: string;
  points: number;
  updated_at?: string;
}

export default function LoyaltyPointsClient() {
  const [points, setPoints] = useState<LoyaltyPoint[]>([]);
  const [newProfileId, setNewProfileId] = useState('');
  const [newPoints, setNewPoints] = useState('');

  const fetchPoints = async () => {
    const res = await fetch('/api/loyalty_points');
    if (res.ok) {
      const data = await res.json();
      setPoints(data);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { profile_id: newProfileId, points: Number(newPoints) };
    const res = await fetch('/api/loyalty_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewProfileId('');
      setNewPoints('');
      fetchPoints();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/loyalty_points', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPoints();
  };

  const handleEdit = async (id: string) => {
    const profile_id = prompt('New profile ID');
    const pointsStr = prompt('New points');
    if (profile_id && pointsStr) {
      await fetch('/api/loyalty_points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile_id, points: Number(pointsStr) }),
      });
      fetchPoints();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loyalty Points</h1>
      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Profile ID</th>
            <th className="p-2 border">Points</th>
            <th className="p-2 border">Updated At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.profile_id}</td>
              <td className="p-2 border">{p.points}</td>
              <td className="p-2 border">{p.updated_at?.split('T')[0]}</td>
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
        <input className="border p-2" placeholder="Profile ID" value={newProfileId} onChange={(e) => setNewProfileId(e.target.value)} required />
        <input type="number" className="border p-2" placeholder="Points" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">Add Loyalty Points</button>
      </form>
    </div>
  );
}
