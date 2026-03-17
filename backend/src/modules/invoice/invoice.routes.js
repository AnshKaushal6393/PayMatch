import { Router } from "express";
import { createInvoice, getInvoiceById, listInvoices, updateInvoice } from "./invoice.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { requireTenantContext } from "../../middleware/tenant.js";
import { ROLES } from "../../utils/roles.js";

const router = Router();

router.use(requireAuth, requireTenantContext);
router.get("/", listInvoices);
router.get("/:id", getInvoiceById);
router.post("/", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), createInvoice);
router.patch("/:id", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), updateInvoice);

export default router;
