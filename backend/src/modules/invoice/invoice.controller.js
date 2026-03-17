import { createInvoiceSchema, updateInvoiceSchema } from "./invoice.validation.js";
import {
  createInvoiceService,
  getInvoiceByIdService,
  listInvoicesService,
  updateInvoiceService
} from "./invoice.service.js";

export async function listInvoices(req, res) {
  const result = await listInvoicesService(req.organizationId, req.query);
  return res.json(result.data);
}

export async function createInvoice(req, res) {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid invoice payload", issues: parsed.error.issues });
  }

  const result = await createInvoiceService(req.organizationId, req.user.sub, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.status(201).json(result.data);
}

export async function getInvoiceById(req, res) {
  const result = await getInvoiceByIdService(req.organizationId, req.params.id);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}

export async function updateInvoice(req, res) {
  const parsed = updateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid invoice payload", issues: parsed.error.issues });
  }

  const result = await updateInvoiceService(req.organizationId, req.user.sub, req.params.id, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}
