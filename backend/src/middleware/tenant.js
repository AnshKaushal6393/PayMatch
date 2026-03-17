export function requireTenantContext(req, res, next) {
  const organizationId =
    req.headers["x-organization-id"] || req.headers["x-tenant-id"] || req.user?.organizationId || req.user?.tenantId;

  if (!organizationId) {
    return res.status(400).json({ message: "Missing organization context" });
  }

  req.organizationId = String(organizationId);
  req.tenantId = req.organizationId;
  return next();
}
