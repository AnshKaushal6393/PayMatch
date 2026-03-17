import { z } from "zod";

export const signupSchema = z.object({
  organizationName: z.string().trim().min(2),
  organizationCode: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().min(2).max(20).optional()
  ),
  adminName: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  tenantCode: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});
