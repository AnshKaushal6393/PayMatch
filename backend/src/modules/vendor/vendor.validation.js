import { z } from "zod";

const addressSchema = z
  .object({
    line1: z.string().trim().optional(),
    line2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().optional()
  })
  .optional();

export const createVendorSchema = z.object({
  name: z.string().trim().min(2),
  vendorCode: z.string().trim().min(2),
  taxId: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  address: addressSchema,
  status: z.enum(["active", "inactive"]).optional()
});

export const updateVendorSchema = createVendorSchema.partial();

