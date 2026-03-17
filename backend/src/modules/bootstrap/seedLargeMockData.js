import bcrypt from "bcryptjs";
import { connectDb } from "../../config/db.js";
import { Invoice } from "../../models/Invoice.js";
import { Payment } from "../../models/Payment.js";
import { Tenant } from "../../models/Tenant.js";
import { User } from "../../models/User.js";
import { Vendor } from "../../models/Vendor.js";
import { ROLES } from "../../utils/roles.js";

function getArgValue(name, fallback) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!match) {
    return fallback;
  }
  const value = match.split("=")[1];
  return value ?? fallback;
}

function toInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomAmount(min = 50, max = 20000) {
  const amount = Math.random() * (max - min) + min;
  return Math.round(amount * 100) / 100;
}

function randomDateWithinLastDays(days) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

async function ensureUser({ organizationId, email, name, role, passwordHash }) {
  let user = await User.findOne({ organizationId, email });
  if (!user) {
    user = await User.create({
      organizationId,
      email,
      name,
      role,
      passwordHash
    });
  }
  return user;
}

async function run() {
  await connectDb();

  const vendorCount = toInt(getArgValue("vendors", "250"), 250);
  const invoiceCount = toInt(getArgValue("invoices", "5000"), 5000);
  const paymentCount = toInt(getArgValue("payments", "5000"), 5000);

  const orgCodeRaw = String(getArgValue("orgCode", "MOCK01")).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const organizationCode = orgCodeRaw || "MOCK01";
  const organizationName = getArgValue("orgName", `Mock Organization ${organizationCode}`);

  let organization = await Tenant.findOne({ code: organizationCode });
  if (!organization) {
    organization = await Tenant.create({
      name: organizationName,
      code: organizationCode,
      currency: "USD",
      timezone: "UTC"
    });
  }

  const organizationId = organization._id;
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await ensureUser({
    organizationId,
    email: `admin+${organizationCode.toLowerCase()}@paymatch.local`,
    name: "Mock Admin",
    role: ROLES.ADMIN,
    passwordHash
  });

  await ensureUser({
    organizationId,
    email: `accountant+${organizationCode.toLowerCase()}@paymatch.local`,
    name: "Mock Accountant",
    role: ROLES.ACCOUNTANT,
    passwordHash
  });

  await ensureUser({
    organizationId,
    email: `auditor+${organizationCode.toLowerCase()}@paymatch.local`,
    name: "Mock Auditor",
    role: ROLES.AUDITOR,
    passwordHash
  });

  const vendorOps = [];
  for (let i = 1; i <= vendorCount; i += 1) {
    const code = `VND-${String(i).padStart(5, "0")}`;
    vendorOps.push({
      updateOne: {
        filter: { organizationId, vendorCode: code },
        update: {
          $setOnInsert: {
            organizationId,
            name: `Vendor ${i}`,
            vendorCode: code,
            taxId: `TAX-${String(i).padStart(6, "0")}`,
            email: `ap+${i}@vendor.local`,
            phone: `+1-555-${String(100000 + i).slice(-6)}`,
            status: Math.random() > 0.08 ? "active" : "inactive",
            createdBy: admin._id,
            updatedBy: admin._id
          }
        },
        upsert: true
      }
    });
  }

  if (vendorOps.length > 0) {
    await Vendor.bulkWrite(vendorOps, { ordered: false });
  }

  const vendors = await Vendor.find({ organizationId }).select({ _id: 1, vendorCode: 1 }).lean();
  if (vendors.length === 0) {
    throw new Error("No vendors available after seeding");
  }

  const invoiceDocs = [];
  const invoiceStatuses = ["new", "matched", "partial", "exception", "closed"];
  for (let i = 1; i <= invoiceCount; i += 1) {
    const vendor = randomChoice(vendors);
    invoiceDocs.push({
      organizationId,
      vendorId: vendor._id,
      invoiceNumber: `INV-${organizationCode}-${String(i).padStart(7, "0")}`,
      invoiceDate: randomDateWithinLastDays(240),
      currency: "USD",
      amount: randomAmount(100, 50000),
      status: randomChoice(invoiceStatuses),
      createdBy: admin._id,
      updatedBy: admin._id
    });
  }

  if (invoiceDocs.length > 0) {
    await Invoice.insertMany(invoiceDocs, { ordered: false });
  }

  const invoiceRefs = await Invoice.find({ organizationId })
    .select({ invoiceNumber: 1, vendorId: 1, amount: 1 })
    .limit(Math.max(500, Math.floor(invoiceCount * 0.8)))
    .lean();

  const paymentDocs = [];
  const paymentStatuses = ["new", "matched", "partial", "exception", "reconciled"];
  for (let i = 1; i <= paymentCount; i += 1) {
    const maybeInvoice = Math.random() > 0.2 ? randomChoice(invoiceRefs) : null;
    const vendorId = maybeInvoice?.vendorId || randomChoice(vendors)._id;
    const baseAmount = maybeInvoice?.amount ?? randomAmount(80, 42000);
    const varianceMultiplier = randomChoice([1, 1, 1, 0.98, 1.02, 0.95, 1.05]);

    paymentDocs.push({
      organizationId,
      vendorId,
      paymentRef: `PAY-${organizationCode}-${String(i).padStart(7, "0")}`,
      paymentDate: randomDateWithinLastDays(200),
      currency: "USD",
      amount: Math.round(baseAmount * varianceMultiplier * 100) / 100,
      invoiceNumber: maybeInvoice?.invoiceNumber,
      status: randomChoice(paymentStatuses),
      createdBy: admin._id,
      updatedBy: admin._id
    });
  }

  if (paymentDocs.length > 0) {
    await Payment.insertMany(paymentDocs, { ordered: false });
  }

  const finalCounts = await Promise.all([
    Vendor.countDocuments({ organizationId }),
    Invoice.countDocuments({ organizationId }),
    Payment.countDocuments({ organizationId }),
    User.countDocuments({ organizationId })
  ]);

  // eslint-disable-next-line no-console
  console.log("Large mock data seed complete");
  // eslint-disable-next-line no-console
  console.log(`Organization: ${organizationName} (${organizationCode})`);
  // eslint-disable-next-line no-console
  console.log(`Users: ${finalCounts[3]} | Vendors: ${finalCounts[0]} | Invoices: ${finalCounts[1]} | Payments: ${finalCounts[2]}`);
  // eslint-disable-next-line no-console
  console.log(`Admin login: admin+${organizationCode.toLowerCase()}@paymatch.local / password123`);

  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Large seed failed:", error.message);
  process.exit(1);
});

