export const MASTER_ADMIN_EMAIL = 'shubhamoy27@gmail.com';

/**
 * Centrally check if a user should have admin privileges.
 * In this system, ONLY the Master Admin (by email) has these privileges.
 */
export function checkIsAdmin(profile: any): boolean {
  if (!profile) return false;
  
  const email = profile.email || '';
  const role = profile.role || '';
  
  // Allow either the Master Admin email OR the 'Admin' role from Firestore
  return email === MASTER_ADMIN_EMAIL || role === 'Admin';
}
