import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: false },
    paymentRef: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
    currency: { type: String, required: true, default: "USD" },
    amount: { type: Number, required: true, min: 0 },
    invoiceNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "matched", "partial", "exception", "reconciled"],
      default: "new"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

paymentSchema.index({ organizationId: 1, paymentRef: 1 }, { unique: true });
paymentSchema.index({ organizationId: 1, status: 1, paymentDate: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);

