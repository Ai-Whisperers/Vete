/**
 * API functions for interacting with the Vete platform.
 * @module lib/api
 */

import { supabaseClient } from './supabase';

/**
 * Retrieves a list of all staff members.
 * @async
 * @returns {Promise<Array<StaffMember>>} A promise resolving to an array of staff members.
 */
export async function getStaffMembers(): Promise<Array<StaffMember>> {
  const { data, error } = await supabaseClient.from('staff').select('*');
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Creates a new staff member.
 * @async
 * @param {StaffMember} staffMember The staff member to create.
 * @returns {Promise<StaffMember>} A promise resolving to the created staff member.
 */
export async function createStaffMember(staffMember: StaffMember): Promise<StaffMember> {
  const { data, error } = await supabaseClient.from('staff').insert([staffMember]);
  if (error) {
    throw error;
  }
  return data[0];
}

/**
 * Retrieves a list of all portal endpoints.
 * @async
 * @returns {Promise<Array<PortalEndpoint>>} A promise resolving to an array of portal endpoints.
 */
export async function getPortalEndpoints(): Promise<Array<PortalEndpoint>> {
  const { data, error } = await supabaseClient.from('portal_endpoints').select('*');
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Creates a new portal endpoint.
 * @async
 * @param {PortalEndpoint} portalEndpoint The portal endpoint to create.
 * @returns {Promise<PortalEndpoint>} A promise resolving to the created portal endpoint.
 */
export async function createPortalEndpoint(portalEndpoint: PortalEndpoint): Promise<PortalEndpoint> {
  const { data, error } = await supabaseClient.from('portal_endpoints').insert([portalEndpoint]);
  if (error) {
    throw error;
  }
  return data[0];
}

/**
 * Retrieves a list of all admin endpoints.
 * @async
 * @returns {Promise<Array<AdminEndpoint>>} A promise resolving to an array of admin endpoints.
 */
export async function getAdminEndpoints(): Promise<Array<AdminEndpoint>> {
  const { data, error } = await supabaseClient.from('admin_endpoints').select('*');
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Creates a new admin endpoint.
 * @async
 * @param {AdminEndpoint} adminEndpoint The admin endpoint to create.
 * @returns {Promise<AdminEndpoint>} A promise resolving to the created admin endpoint.
 */
export async function createAdminEndpoint(adminEndpoint: AdminEndpoint): Promise<AdminEndpoint> {
  const { data, error } = await supabaseClient.from('admin_endpoints').insert([adminEndpoint]);
  if (error) {
    throw error;
  }
  return data[0];
}

/**
 * Example usage:
 * ```typescript
 * import { getStaffMembers } from './api';
 * 
 * async function main() {
 *   const staffMembers = await getStaffMembers();
 *   console.log(staffMembers);
 * }
 * 
 * main();
 * ```
 */

interface StaffMember {
  id: number;
  name: string;
  email: string;
}

interface PortalEndpoint {
  id: number;
  name: string;
  url: string;
}

interface AdminEndpoint {
  id: number;
  name: string;
  url: string;
}