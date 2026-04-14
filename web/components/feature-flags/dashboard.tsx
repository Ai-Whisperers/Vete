import { useState, useEffect } from 'react';
import { useSupabase } from '../../../lib/supabase/client';

export default function FeatureFlagDashboard() {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const supabase = useSupabase();

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      const featureFlags = await supabase.from('feature_flags').select('feature, enabled').eq('tenant_id', tenantId);
      setFeatureFlags(featureFlags.data);
    };

    fetchFeatureFlags();
  }, [tenantId, supabase]);

  const handleUpdateFeatureFlag = async (feature: string, enabled: boolean) => {
    await supabase.from('feature_flags').update({ enabled }).eq('tenant_id', tenantId).eq('feature', feature);
    setFeatureFlags((prevFeatureFlags) => prevFeatureFlags.map((flag) => (flag.feature === feature ? { ...flag, enabled } : flag)));
  };

  return (
    <div>
      <h1>Feature Flag Dashboard</h1>
      <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
        <option value="">Select a tenant</option>
        {/* Add tenant options here */}
      </select>
      <ul>
        {featureFlags.map((flag) => (
          <li key={flag.feature}>
            <span>{flag.feature}</span>
            <input type="checkbox" checked={flag.enabled} onChange={(e) => handleUpdateFeatureFlag(flag.feature, e.target.checked)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

This implementation provides a basic feature flag system with a dashboard to display and update feature flags for each tenant. The `FeatureFlagService` handles the business logic for feature flags, and the `FeatureFlagRepository` handles the data access. The API routes provide a way to retrieve and update feature flags, and the feature flag dashboard provides a user interface to manage feature flags.