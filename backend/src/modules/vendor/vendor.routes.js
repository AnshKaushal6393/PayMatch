import { Router } from "express";
import {
  createVendor,
  getVendorById,
  listVendors,
  updateVendor
} from "./vendor.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { requireTenantContext } from "../../middleware/tenant.js";
import { ROLES } from "../../utils/roles.js";

const router = Router();

router.use(requireAuth, requireTenantContext);
router.get("/", listVendors);
router.get("/:id", getVendorById);
router.post("/", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), createVendor);
router.patch("/:id", requireRole(ROLES.ADMIN, ROLES.ACCOUNTANT), updateVendor);

export default router;
