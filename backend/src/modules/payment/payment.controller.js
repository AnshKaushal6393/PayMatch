import { createPaymentSchema, updatePaymentSchema } from "./payment.validation.js";
import {
  createPaymentService,
  getPaymentByIdService,
  listPaymentsService,
  updatePaymentService
} from "./payment.service.js";

export async function listPayments(req, res) {
  const result = await listPaymentsService(req.organizationId, req.query);
  return res.json(result.data);
}

export async function createPayment(req, res) {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payment payload", issues: parsed.error.issues });
  }

  const result = await createPaymentService(req.organizationId, req.user.sub, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.status(201).json(result.data);
}

export async function getPaymentById(req, res) {
  const result = await getPaymentByIdService(req.organizationId, req.params.id);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}

export async function updatePayment(req, res) {
  const parsed = updatePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payment payload", issues: parsed.error.issues });
  }

  const result = await updatePaymentService(req.organizationId, req.user.sub, req.params.id, parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}
