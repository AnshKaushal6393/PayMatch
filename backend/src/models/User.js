import mongoose from "mongoose";
import { ROLES } from "../utils/roles.js";

const userSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.AUDITOR],
      default: ROLES.ACCOUNTANT
    },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
