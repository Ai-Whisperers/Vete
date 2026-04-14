import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ApiKey, Scope } from '../types/api-keys';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [newScope, setNewScope] = useState('');

  useEffect(() => {
    fetchApiKeys();
    fetchScopes();
  }, []);

  const fetchApiKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      setApiKeys(data);
    }
  };

  const fetchScopes = async () => {
    const { data, error } = await supabase
      .from('scopes')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      setScopes(data);
    }
  };

  const generateApiKey = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{ key: newApiKey, scope: newScope }]);
    if (error) {
      console.error(error);
    } else {
      setApiKeys([...apiKeys, data[0]]);
      setNewApiKey('');
      setNewScope('');
    }
  };

  const revokeApiKey = async (id: number) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
    } else {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
    }
  };

  return (
    <div>
      <h1>API Key Management</h1>
      <h2>Generate API Key</h2>
      <input
        type="text"
        value={newApiKey}
        onChange={(e) => setNewApiKey(e.target.value)}
        placeholder="New API Key"
      />
      <select
        value={newScope}
        onChange={(e) => setNewScope(e.target.value)}
      >
        {scopes.map((scope) => (
          <option key={scope.id} value={scope.name}>
            {scope.name}
          </option>
        ))}
      </select>
      <button onClick={generateApiKey}>Generate</button>
      <h2>API Keys</h2>
      <ul>
        {apiKeys.map((key) => (
          <li key={key.id}>
            {key.key} ({key.scope})
            <button onClick={() => revokeApiKey(key.id)}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApiKeyManagement;