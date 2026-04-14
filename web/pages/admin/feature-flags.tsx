import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TenantFeatureFlags from '../components/TenantFeatureFlags';

interface AdminFeatureFlagsProps {}

const AdminFeatureFlags: React.FC<AdminFeatureFlagsProps> = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) {
        console.error(error);
      } else {
        setTenants(data);
      }
    };
    fetchTenants();
  }, []);

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
  };

  return (
    <div>
      <h2>Feature Flags</h2>
      <select value={selectedTenant?.id} onChange={(e) => handleSelectTenant(tenants.find((t) => t.id === e.target.value))}>
        <option value="">Select a tenant</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      {selectedTenant && <TenantFeatureFlags tenant={selectedTenant} />}
    </div>
  );
};

export default AdminFeatureFlags;