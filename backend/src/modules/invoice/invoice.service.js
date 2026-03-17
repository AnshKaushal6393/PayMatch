import mongoose from "mongoose";
import { Invoice } from "../../models/Invoice.js";
import { scopedFilter } from "../../utils/organizationScope.js";

export async function listInvoicesService(organizationId, query) {
  const filter = scopedFilter(organizationId);

  if (typeof query.status === "string") {
    filter.status = query.status;
  }

  const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
  return {
    data: invoices.map((invoice) => ({
      id: invoice._id.toString(),
      organizationId: invoice.organizationId.toString(),
      vendorId: invoice.vendorId.toString(),
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      currency: invoice.currency,
      amount: invoice.amount,
      status: invoice.status
    }))
  };
}

export async function createInvoiceService(organizationId, actorId, payload) {
  if (!mongoose.Types.ObjectId.isValid(payload.vendorId)) {
    return { error: { status: 400, message: "Invalid vendorId" } };
  }

  try {
    const invoice = await Invoice.create({
      ...scopedFilter(organizationId),
      vendorId: payload.vendorId,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate,
      currency: payload.currency || "USD",
      amount: payload.amount,
      status: payload.status || "new",
      createdBy: actorId,
      updatedBy: actorId
    });

    return {
      data: {
        id: invoice._id.toString(),
        organizationId: invoice.organizationId.toString(),
        vendorId: invoice.vendorId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Duplicate invoice for this organization and vendor" } };
    }
    return { error: { status: 500, message: "Unable to create invoice" } };
  }
}

export async function getInvoiceByIdService(organizationId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid invoice id" } };
  }

  const invoice = await Invoice.findOne(scopedFilter(organizationId, { _id: id })).lean();
  if (!invoice) {
    return { error: { status: 404, message: "Invoice not found" } };
  }

  return {
    data: {
      id: invoice._id.toString(),
      organizationId: invoice.organizationId.toString(),
      vendorId: invoice.vendorId.toString(),
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      currency: invoice.currency,
      amount: invoice.amount,
      status: invoice.status
    }
  };
}

export async function updateInvoiceService(organizationId, actorId, id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid invoice id" } };
  }
  if (payload.vendorId && !mongoose.Types.ObjectId.isValid(payload.vendorId)) {
    return { error: { status: 400, message: "Invalid vendorId" } };
  }

  try {
    const invoice = await Invoice.findOneAndUpdate(
      scopedFilter(organizationId, { _id: id }),
      { ...payload, updatedBy: actorId },
      { new: true }
    ).lean();

    if (!invoice) {
      return { error: { status: 404, message: "Invoice not found" } };
    }

    return {
      data: {
        id: invoice._id.toString(),
        organizationId: invoice.organizationId.toString(),
        vendorId: invoice.vendorId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Duplicate invoice for this organization and vendor" } };
    }
    return { error: { status: 500, message: "Unable to update invoice" } };
  }
}
