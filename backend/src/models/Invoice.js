import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    invoiceNumber: { type: String, required: true, trim: true },
    invoiceDate: { type: Date, required: true },
    currency: { type: String, required: true, default: "USD" },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["new", "matched", "partial", "exception", "closed"],
      default: "new"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

invoiceSchema.index({ organizationId: 1, vendorId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ organizationId: 1, status: 1, invoiceDate: -1 });

export const Invoice = mongoose.model("Invoice", invoiceSchema);

