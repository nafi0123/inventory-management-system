"use server";
import connectDB from "@/app/lib/db";
import Supplier from "@/app/models/Supplier";
import { revalidatePath } from "next/cache";

// ১. গেট অল সাপ্লায়ার
export const getAllSuppliersAction = async (searchQuery = "", page = 1, limit = 10) => {
  try {
    await connectDB();
    const query = searchQuery ? {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { companyName: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
      ],
    } : {};
    const skip = (page - 1) * limit;
    const [suppliers, totalItems] = await Promise.all([
      Supplier.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(query)
    ]);
    return { success: true, data: JSON.parse(JSON.stringify(suppliers)), totalPages: Math.ceil(totalItems / limit), totalItems };
  } catch (error: any) { return { success: false, message: error.message }; }
};

// ২. ক্রিয়েট সাপ্লায়ার
export const createSupplierAction = async (formData: any) => {
  try {
    await connectDB();
    const existing = await Supplier.findOne({ phone: formData.phone });
    if (existing) return { success: false, message: "Supplier with this phone already exists!" };
    await Supplier.create(formData);
    revalidatePath("/suppliers/all");
    return { success: true, message: "Supplier added successfully!" };
  } catch (error: any) { return { success: false, message: error.message }; }
};

// ৩. আপডেট সাপ্লায়ার (নতুন যোগ করা হয়েছে)
export const updateSupplierAction = async (id: string, data: any) => {
  try {
    await connectDB();
    await Supplier.findByIdAndUpdate(id, data);
    revalidatePath("/suppliers/all");
    return { success: true, message: "Supplier updated successfully!" };
  } catch (error: any) { return { success: false, message: error.message }; }
};

// ৪. ডিলিট সাপ্লায়ার
export const deleteSupplierAction = async (id: string) => {
  try {
    await connectDB();
    await Supplier.findByIdAndDelete(id);
    revalidatePath("/suppliers/all");
    return { success: true, message: "Supplier deleted successfully!" };
  } catch (error: any) { return { success: false, message: error.message }; }
};