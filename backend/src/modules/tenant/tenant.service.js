import { Tenant } from "../../models/Tenant.js";

export async function getTenantMeService(tenantId) {
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    return { error: { status: 404, message: "Tenant not found" } };
  }
  return {
    data: {
      id: tenant._id.toString(),
      name: tenant.name,
      code: tenant.code,
      currency: tenant.currency,
      timezone: tenant.timezone
    }
  };
}

