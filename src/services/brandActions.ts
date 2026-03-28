"use server";
import connectDB from "@/app/lib/db";
import Brand from "@/app/models/Brand";
import { revalidatePath } from "next/cache";

export const createBrandAction = async (name: string, categoryId: string) => {
  try {
    await connectDB();
    const brand = await Brand.create({ name, category: categoryId });
    revalidatePath("/stock/brands");
    return { success: true, data: JSON.parse(JSON.stringify(brand)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAllBrandsAction = async (query = "", page = 1, limit = 10) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const filter = query ? { name: { $regex: query, $options: "i" } } : {};
    
    const brands = await Brand.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Brand.countDocuments(filter);
    return { success: true, data: JSON.parse(JSON.stringify(brands)), totalItems: total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    return { success: false, data: [], totalPages: 0 };
  }
};

// প্রোডাক্ট পেজের জন্য নির্দিষ্ট ক্যাটাগরির ব্র্যান্ড পাওয়ার ফাংশন
export const getBrandsByCategoryAction = async (categoryId: string) => {
  try {
    await connectDB();
    const brands = await Brand.find({ category: categoryId });
    return { success: true, data: JSON.parse(JSON.stringify(brands)) };
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const deleteBrandAction = async (id: string) => {
  try {
    await connectDB();
    await Brand.findByIdAndDelete(id);
    revalidatePath("/stock/brands");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};