export interface PermissionMatrix {
  [roleId: string]: {
    [permissionId: string]: boolean
  }
}

### Role Assignment

We need to create a role assignment system to assign roles to staff members.