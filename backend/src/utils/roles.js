export const ROLES = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
  AUDITOR: "Auditor"
};

const LEGACY_ROLE_MAP = {
  TENANT_ADMIN: ROLES.ADMIN,
  AP_MANAGER: ROLES.ACCOUNTANT,
  APPROVER: ROLES.ACCOUNTANT,
  AUDITOR: ROLES.AUDITOR,
  VIEWER: ROLES.AUDITOR
};

export function normalizeRole(role) {
  if (!role) {
    return null;
  }
  if (role === ROLES.ADMIN || role === ROLES.ACCOUNTANT || role === ROLES.AUDITOR) {
    return role;
  }
  return LEGACY_ROLE_MAP[role] || null;
}

