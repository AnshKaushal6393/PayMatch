import { loginSchema, signupSchema } from "./auth.validation.js";
import { loginService, meService, signupService } from "./auth.service.js";

export async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid signup payload", issues: parsed.error.issues });
  }

  const result = await signupService(parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.status(201).json(result.data);
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload" });
  }

  const result = await loginService(parsed.data);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}

export async function me(req, res) {
  const result = await meService(req.organizationId, req.user.sub);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  return res.json(result.data);
}
