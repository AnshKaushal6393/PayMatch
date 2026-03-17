import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireTenantContext } from "../../middleware/tenant.js";
import { login, me, signup } from "./auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, requireTenantContext, me);

export default router;

