import { normalizeRole } from "../utils/roles.js";

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = normalizeRole(req.user?.role);
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    return next();
  };
}
