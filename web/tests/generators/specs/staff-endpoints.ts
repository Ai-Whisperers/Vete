/**
 * Tests for staff endpoints.
 * @module tests/generators/specs/staff-endpoints
 */

import { getStaffMembers, createStaffMember } from '../../lib/api';

describe('Staff Endpoints', () => {
  it('should retrieve a list of staff members', async () => {
    const staffMembers = await getStaffMembers();
    expect(staffMembers).toBeInstanceOf(Array);
  });

  it('should create a new staff member', async () => {
    const staffMember = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const createdStaffMember = await createStaffMember(staffMember);
    expect(createdStaffMember).toHaveProperty('id');
    expect(createdStaffMember).toHaveProperty('name', staffMember.name);
    expect(createdStaffMember).toHaveProperty('email', staffMember.email);
  });
});