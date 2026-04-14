import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

interface TenantFeatureFlagsProps {
  tenant: Tenant;
}

const TenantFeatureFlags: React.FC<TenantFeatureFlagsProps> = ({ tenant }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('tenant_id', tenant.id);
      if (error) {
        console.error(error);
      } else {
        setFeatureFlags(data);
      }
      setLoading(false);
    };
    fetchFeatureFlags();
  }, [tenant.id]);

  const handleToggleFeatureFlag = async (featureFlag: FeatureFlag) => {
    const { data, error } = await supabase
      .from('feature_flags')
      .update({
        id: featureFlag.id,
        enabled: !featureFlag.enabled,
      });
    if (error) {
      console.error(error);
    } else {
      setFeatureFlags(
        featureFlags.map((flag) =>
          flag.id === featureFlag.id ? { ...flag, enabled: !flag.enabled } : flag
        )
      );
    }
  };

  return (
    <div>
      <h2>Feature Flags for {tenant.name}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {featureFlags.map((featureFlag) => (
            <li key={featureFlag.id}>
              <label>
                <input
                  type="checkbox"
                  checked={featureFlag.enabled}
                  onChange={() => handleToggleFeatureFlag(featureFlag)}
                />
                {featureFlag.name}
              </label>
              <p>{featureFlag.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TenantFeatureFlags;