import bcrypt from "bcryptjs";
import { Tenant } from "../../models/Tenant.js";
import { User } from "../../models/User.js";
import { assertOrganizationId, scopedFilterWithLegacy } from "../../utils/organizationScope.js";
import { normalizeRole, ROLES } from "../../utils/roles.js";
import { signAccessToken } from "../../utils/jwt.js";

function normalizeTenantCode(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
}

function getUserOrganizationId(user) {
  return user.organizationId || user.tenantId;
}

function buildAuthResponse(user, accessToken) {
  const organizationId = getUserOrganizationId(user);
  const role = normalizeRole(user.role);
  return {
    accessToken,
    user: {
      id: user._id.toString(),
      organizationId: organizationId.toString(),
      role,
      email: user.email,
      name: user.name
    }
  };
}

export async function signupService(payload) {
  const { organizationName, organizationCode, adminName, email, password } = payload;
  const tenantCode = normalizeTenantCode(organizationCode || organizationName);

  if (!tenantCode) {
    return { error: { status: 400, message: "Invalid organization code" } };
  }

  try {
    const organization = await Tenant.create({
      name: organizationName,
      code: tenantCode
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      organizationId: organization._id,
      name: adminName,
      email: email.toLowerCase(),
      role: ROLES.ADMIN,
      passwordHash
    });

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      organizationId: organization._id.toString(),
      role: normalizeRole(user.role),
      email: user.email
    });

    return {
      data: {
        ...buildAuthResponse(user, accessToken),
        tenant: {
          id: organization._id.toString(),
          name: organization.name,
          code: organization.code
        },
        organization: {
          id: organization._id.toString(),
          name: organization.name,
          code: organization.code
        }
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Organization code or admin email already exists" } };
    }
    return { error: { status: 500, message: "Unable to complete signup" } };
  }
}

export async function loginService(payload) {
  const { tenantCode, email, password } = payload;
  const organization = await Tenant.findOne({ code: normalizeTenantCode(tenantCode) }).lean();
  if (!organization) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  const user = await User.findOne(
    scopedFilterWithLegacy(organization._id.toString(), { email: email.toLowerCase() })
  ).lean();
  if (!user) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  const token = signAccessToken({
    sub: user._id.toString(),
    organizationId: getUserOrganizationId(user).toString(),
    role: normalizeRole(user.role),
    email: user.email
  });

  return {
    data: {
      ...buildAuthResponse(user, token),
      tenant: {
        id: organization._id.toString(),
        name: organization.name,
        code: organization.code
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        code: organization.code
      }
    }
  };
}

export async function meService(organizationId, userId) {
  assertOrganizationId(organizationId);

  const [organization, user] = await Promise.all([
    Tenant.findById(organizationId).lean(),
    User.findById(userId).lean()
  ]);

  const userOrganizationId = getUserOrganizationId(user);
  if (!organization || !user || !userOrganizationId || userOrganizationId.toString() !== organizationId) {
    return { error: { status: 401, message: "Session is no longer valid" } };
  }

  return {
    data: {
      user: {
        id: user._id.toString(),
        organizationId: userOrganizationId.toString(),
        role: normalizeRole(user.role),
        email: user.email,
        name: user.name
      },
      tenant: {
        id: organization._id.toString(),
        name: organization.name,
        code: organization.code,
        currency: organization.currency,
        timezone: organization.timezone
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        code: organization.code,
        currency: organization.currency,
        timezone: organization.timezone
      }
    }
  };
}
