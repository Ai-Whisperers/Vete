import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Policy } from '../types/Policy';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState<Policy>({ id: 0, name: '', coverageDetails: '', renewalDate: new Date() });
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const fetchPolicies = async () => {
    const { data, error } = await supabase.from('policies').select('*');
    if (error) {
      console.error(error);
    } else {
      setPolicies(data);
    }
  };

  const createPolicy = async (policy: Policy) => {
    const { data, error } = await supabase.from('policies').insert([policy]);
    if (error) {
      console.error(error);
    } else {
      setPolicies([...policies, data[0]]);
    }
  };

  const updatePolicy = async (policy: Policy) => {
    const { data, error } = await supabase.from('policies').update([policy]);
    if (error) {
      console.error(error);
    } else {
      setPolicies(policies.map((p) => (p.id === policy.id ? policy : p)));
    }
  };

  const deletePolicy = async (id: number) => {
    const { error } = await supabase.from('policies').delete().eq('id', id);
    if (error) {
      console.error(error);
    } else {
      setPolicies(policies.filter((p) => p.id !== id));
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async () => {
    await createPolicy(newPolicy);
    setNewPolicy({ id: 0, name: '', coverageDetails: '', renewalDate: new Date() });
  };

  const handleUpdatePolicy = async () => {
    if (editingPolicy) {
      await updatePolicy(editingPolicy);
      setEditingPolicy(null);
    }
  };

  const handleDeletePolicy = async (id: number) => {
    await deletePolicy(id);
  };

  return (
    <div>
      <h1>Policy Management</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Coverage Details</th>
            <th>Renewal Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.id}</td>
              <td>{policy.name}</td>
              <td>{policy.coverageDetails}</td>
              <td>{policy.renewalDate.toISOString().split('T')[0]}</td>
              <td>
                <button onClick={() => setEditingPolicy(policy)}>Edit</button>
                <button onClick={() => handleDeletePolicy(policy.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingPolicy ? (
        <div>
          <h2>Edit Policy</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingPolicy.name} onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })} />
            </label>
            <label>
              Coverage Details:
              <input type="text" value={editingPolicy.coverageDetails} onChange={(e) => setEditingPolicy({ ...editingPolicy, coverageDetails: e.target.value })} />
            </label>
            <label>
              Renewal Date:
              <input type="date" value={editingPolicy.renewalDate.toISOString().split('T')[0]} onChange={(e) => setEditingPolicy({ ...editingPolicy, renewalDate: new Date(e.target.value) })} />
            </label>
            <button onClick={handleUpdatePolicy}>Update</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Create Policy</h2>
          <form>
            <label>
              Name:
              <input type="text" value={newPolicy.name} onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })} />
            </label>
            <label>
              Coverage Details:
              <input type="text" value={newPolicy.coverageDetails} onChange={(e) => setNewPolicy({ ...newPolicy, coverageDetails: e.target.value })} />
            </label>
            <label>
              Renewal Date:
              <input type="date" value={newPolicy.renewalDate.toISOString().split('T')[0]} onChange={(e) => setNewPolicy({ ...newPolicy, renewalDate: new Date(e.target.value) })} />
            </label>
            <button onClick={handleCreatePolicy}>Create</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;