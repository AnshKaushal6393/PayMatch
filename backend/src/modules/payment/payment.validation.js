import { z } from "zod";

export const createPaymentSchema = z.object({
  paymentRef: z.string().trim().min(1),
  paymentDate: z.string().datetime(),
  currency: z.string().trim().min(3).max(3).optional(),
  amount: z.number().positive(),
  vendorId: z.string().optional(),
  invoiceNumber: z.string().trim().optional(),
  status: z.enum(["new", "matched", "partial", "exception", "reconciled"]).optional()
});

export const updatePaymentSchema = z
  .object({
    paymentRef: z.string().trim().min(1).optional(),
    paymentDate: z.string().datetime().optional(),
    currency: z.string().trim().min(3).max(3).optional(),
    amount: z.number().positive().optional(),
    vendorId: z.string().optional(),
    invoiceNumber: z.string().trim().optional(),
    status: z.enum(["new", "matched", "partial", "exception", "reconciled"]).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, "No fields provided for update");
