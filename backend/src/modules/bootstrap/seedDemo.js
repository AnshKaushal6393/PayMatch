import bcrypt from "bcryptjs";
import { connectDb } from "../../config/db.js";
import { Tenant } from "../../models/Tenant.js";
import { User } from "../../models/User.js";
import { ROLES } from "../../utils/roles.js";

async function run() {
  await connectDb();

  let tenant = await Tenant.findOne({ code: "DEMO" });
  if (!tenant) {
    tenant = await Tenant.create({
      name: "Demo Tenant",
      code: "DEMO",
      currency: "USD",
      timezone: "UTC"
    });
  }

  const existingUser = await User.findOne({ email: "admin@demo.com" });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await User.create({
      organizationId: tenant._id,
      name: "Tenant Admin",
      email: "admin@demo.com",
      role: ROLES.ADMIN,
      passwordHash
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete: admin@demo.com / admin123");
  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", error.message);
  process.exit(1);
});
