import { Router } from "express";
import { createPayment, getPaymentById, listPayments, updatePayment } from "./payment.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { requireTenantContext } from "../../middleware/tenant.js";
import { ROLES } from "../../utils/roles.js";

const router = Router();

router.use(requireAuth, requireTenantContext);
router.get("/", listPayments);
router.get("/:id", getPaymentById);
router.post("/", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), createPayment);
router.patch("/:id", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), updatePayment);

export default router;
