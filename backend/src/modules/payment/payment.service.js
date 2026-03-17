import mongoose from "mongoose";
import { Payment } from "../../models/Payment.js";
import { scopedFilter } from "../../utils/organizationScope.js";

export async function listPaymentsService(organizationId, query) {
  const filter = scopedFilter(organizationId);
  if (typeof query.status === "string") {
    filter.status = query.status;
  }

  const payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();
  return {
    data: payments.map((payment) => ({
      id: payment._id.toString(),
      organizationId: payment.organizationId.toString(),
      paymentRef: payment.paymentRef,
      paymentDate: payment.paymentDate,
      currency: payment.currency,
      amount: payment.amount,
      status: payment.status,
      vendorId: payment.vendorId ? payment.vendorId.toString() : null,
      invoiceNumber: payment.invoiceNumber || null
    }))
  };
}

export async function createPaymentService(organizationId, actorId, payload) {
  if (payload.vendorId && !mongoose.Types.ObjectId.isValid(payload.vendorId)) {
    return { error: { status: 400, message: "Invalid vendorId" } };
  }

  try {
    const payment = await Payment.create({
      ...scopedFilter(organizationId),
      paymentRef: payload.paymentRef,
      paymentDate: payload.paymentDate,
      currency: payload.currency || "USD",
      amount: payload.amount,
      vendorId: payload.vendorId || undefined,
      invoiceNumber: payload.invoiceNumber || undefined,
      status: payload.status || "new",
      createdBy: actorId,
      updatedBy: actorId
    });

    return {
      data: {
        id: payment._id.toString(),
        organizationId: payment.organizationId.toString(),
        paymentRef: payment.paymentRef,
        status: payment.status
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Duplicate payment reference for this organization" } };
    }
    return { error: { status: 500, message: "Unable to create payment" } };
  }
}

export async function getPaymentByIdService(organizationId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid payment id" } };
  }

  const payment = await Payment.findOne(scopedFilter(organizationId, { _id: id })).lean();
  if (!payment) {
    return { error: { status: 404, message: "Payment not found" } };
  }

  return {
    data: {
      id: payment._id.toString(),
      organizationId: payment.organizationId.toString(),
      paymentRef: payment.paymentRef,
      paymentDate: payment.paymentDate,
      currency: payment.currency,
      amount: payment.amount,
      status: payment.status,
      vendorId: payment.vendorId ? payment.vendorId.toString() : null,
      invoiceNumber: payment.invoiceNumber || null
    }
  };
}

export async function updatePaymentService(organizationId, actorId, id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid payment id" } };
  }
  if (payload.vendorId && !mongoose.Types.ObjectId.isValid(payload.vendorId)) {
    return { error: { status: 400, message: "Invalid vendorId" } };
  }

  try {
    const payment = await Payment.findOneAndUpdate(
      scopedFilter(organizationId, { _id: id }),
      { ...payload, updatedBy: actorId },
      { new: true }
    ).lean();

    if (!payment) {
      return { error: { status: 404, message: "Payment not found" } };
    }

    return {
      data: {
        id: payment._id.toString(),
        organizationId: payment.organizationId.toString(),
        paymentRef: payment.paymentRef,
        status: payment.status
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Duplicate payment reference for this organization" } };
    }
    return { error: { status: 500, message: "Unable to update payment" } };
  }
}
