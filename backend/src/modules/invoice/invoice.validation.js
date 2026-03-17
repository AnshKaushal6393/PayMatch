import { z } from "zod";

export const createInvoiceSchema = z.object({
  vendorId: z.string().min(1),
  invoiceNumber: z.string().trim().min(1),
  invoiceDate: z.string().datetime(),
  currency: z.string().trim().min(3).max(3).optional(),
  amount: z.number().positive(),
  status: z.enum(["new", "matched", "partial", "exception", "closed"]).optional()
});

export const updateInvoiceSchema = z
  .object({
    vendorId: z.string().min(1).optional(),
    invoiceNumber: z.string().trim().min(1).optional(),
    invoiceDate: z.string().datetime().optional(),
    currency: z.string().trim().min(3).max(3).optional(),
    amount: z.number().positive().optional(),
    status: z.enum(["new", "matched", "partial", "exception", "closed"]).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, "No fields provided for update");
