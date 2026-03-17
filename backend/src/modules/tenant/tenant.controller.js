import { getTenantMeService } from "./tenant.service.js";

export async function getTenantMe(req, res) {
  const result = await getTenantMeService(req.organizationId);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}
