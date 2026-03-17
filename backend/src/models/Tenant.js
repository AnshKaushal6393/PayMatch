import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
