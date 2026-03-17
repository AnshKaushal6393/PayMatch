export function assertOrganizationId(organizationId) {
  if (!organizationId) {
    const error = new Error("Missing organizationId context");
    error.statusCode = 400;
    throw error;
  }
}

export function scopedFilter(organizationId, extra = {}) {
  assertOrganizationId(organizationId);
  return { organizationId, ...extra };
}

export function scopedFilterWithLegacy(organizationId, extra = {}) {
  assertOrganizationId(organizationId);
  return {
    ...extra,
    $or: [{ organizationId }, { tenantId: organizationId }]
  };
}

