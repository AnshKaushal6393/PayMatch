import mongoose from "mongoose";
import { Vendor } from "../../models/Vendor.js";
import { scopedFilter, scopedFilterWithLegacy } from "../../utils/organizationScope.js";

export async function listVendorsService(organizationId, query) {
  const { status, q } = query;
  const filter = scopedFilterWithLegacy(organizationId);

  if (typeof status === "string" && ["active", "inactive"].includes(status)) {
    filter.status = status;
  }

  if (typeof q === "string" && q.trim()) {
    filter.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { vendorCode: { $regex: q.trim(), $options: "i" } },
      { taxId: { $regex: q.trim(), $options: "i" } }
    ];
  }

  const vendors = await Vendor.find(filter).sort({ createdAt: -1 }).lean();
  return {
    data: vendors.map((vendor) => ({
      id: vendor._id.toString(),
      name: vendor.name,
      vendorCode: vendor.vendorCode,
      taxId: vendor.taxId || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      status: vendor.status,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    }))
  };
}

export async function getVendorByIdService(organizationId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid vendor id" } };
  }

  const vendor = await Vendor.findOne(scopedFilterWithLegacy(organizationId, { _id: id })).lean();
  if (!vendor) {
    return { error: { status: 404, message: "Vendor not found" } };
  }

  return {
    data: {
      id: vendor._id.toString(),
      name: vendor.name,
      vendorCode: vendor.vendorCode,
      taxId: vendor.taxId || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      address: vendor.address || null,
      status: vendor.status,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    }
  };
}

export async function createVendorService(organizationId, actorId, payload) {
  try {
    const vendor = await Vendor.create({
      ...scopedFilter(organizationId),
      ...payload,
      createdBy: actorId,
      updatedBy: actorId
    });

    return {
      data: {
        id: vendor._id.toString(),
        name: vendor.name,
        vendorCode: vendor.vendorCode,
        status: vendor.status
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Vendor code already exists for this organization" } };
    }
    return { error: { status: 500, message: "Unable to create vendor" } };
  }
}

export async function updateVendorService(organizationId, actorId, id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: { status: 400, message: "Invalid vendor id" } };
  }

  try {
    const vendor = await Vendor.findOneAndUpdate(
      scopedFilterWithLegacy(organizationId, { _id: id }),
      { ...payload, updatedBy: actorId },
      { new: true }
    ).lean();

    if (!vendor) {
      return { error: { status: 404, message: "Vendor not found" } };
    }

    return {
      data: {
        id: vendor._id.toString(),
        name: vendor.name,
        vendorCode: vendor.vendorCode,
        status: vendor.status,
        updatedAt: vendor.updatedAt
      }
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { error: { status: 409, message: "Vendor code already exists for this organization" } };
    }
    return { error: { status: 500, message: "Unable to update vendor" } };
  }
}
