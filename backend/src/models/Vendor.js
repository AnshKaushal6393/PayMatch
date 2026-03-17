import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    vendorCode: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

vendorSchema.index({ organizationId: 1, vendorCode: 1 }, { unique: true });
vendorSchema.index({ organizationId: 1, name: 1 });
vendorSchema.index({ organizationId: 1, status: 1 });

export const Vendor = mongoose.model("Vendor", vendorSchema);
