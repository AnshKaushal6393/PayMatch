import { createVendorSchema, updateVendorSchema } from "./vendor.validation.js";
import {
  createVendorService,
  getVendorByIdService,
  listVendorsService,
  updateVendorService
} from "./vendor.service.js";

export async function listVendors(req, res) {
  const result = await listVendorsService(req.organizationId, req.query);
  return res.json(result.data);
}

export async function getVendorById(req, res) {
  const result = await getVendorByIdService(req.organizationId, req.params.id);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}

export async function createVendor(req, res) {
  const parsed = createVendorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid vendor payload", issues: parsed.error.issues });
  }

  const result = await createVendorService(req.organizationId, req.user.sub, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.status(201).json(result.data);
}

export async function updateVendor(req, res) {
  const parsed = updateVendorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid vendor payload", issues: parsed.error.issues });
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  const result = await updateVendorService(req.organizationId, req.user.sub, req.params.id, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}
