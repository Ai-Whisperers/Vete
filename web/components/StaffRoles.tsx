import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Role, Permission } from '../types';

const StaffRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState<string>('');

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) {
        console.error(error);
      } else {
        setRoles(data);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      const { data, error } = await supabase.from('permissions').select('*');
      if (error) {
        console.error(error);
      } else {
        setPermissions(data);
      }
    };
    fetchPermissions();
  }, []);

  const handleRoleCreation = async () => {
    const { data, error } = await supabase.from('roles').insert([{ name: newRoleName }]);
    if (error) {
      console.error(error);
    } else {
      setRoles([...roles, data[0]]);
      setNewRoleName('');
    }
  };

  const handleRoleAssignment = async (roleId: string, userId: string) => {
    const { data, error } = await supabase.from('user_roles').insert([{ user_id: userId, role_id: roleId }]);
    if (error) {
      console.error(error);
    } else {
      console.log('Role assigned successfully');
    }
  };

  const handlePermissionAssignment = async (roleId: string, permissionId: string) => {
    const { data, error } = await supabase.from('role_permissions').insert([{ role_id: roleId, permission_id: permissionId }]);
    if (error) {
      console.error(error);
    } else {
      console.log('Permission assigned successfully');
    }
  };

  return (
    <div>
      <h1>Staff Roles</h1>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>
            {role.name}
            <button onClick={() => setSelectedRole(role.id)}>Edit</button>
          </li>
        ))}
      </ul>
      <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
      <button onClick={handleRoleCreation}>Create Role</button>
      {selectedRole && (
        <div>
          <h2>Assign Role to User</h2>
          <input type="text" placeholder="User ID" />
          <button onClick={() => handleRoleAssignment(selectedRole, 'user-id')}>Assign</button>
          <h2>Assign Permission to Role</h2>
          <ul>
            {permissions.map((permission) => (
              <li key={permission.id}>
                {permission.name}
                <button onClick={() => handlePermissionAssignment(selectedRole, permission.id)}>Assign</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StaffRoles;