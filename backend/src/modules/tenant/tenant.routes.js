import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireTenantContext } from "../../middleware/tenant.js";
import { getTenantMe } from "./tenant.controller.js";

const router = Router();

router.get("/me", requireAuth, requireTenantContext, getTenantMe);

export default router;

