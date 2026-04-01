"use server";
import connectDB from "@/app/lib/db";
import Brand from "@/app/models/Brand";
import { revalidatePath } from "next/cache";

export const createBrandAction = async (name: string, categoryId: string) => {
  try {
    await connectDB();

    // ১. একই ক্যাটাগরিতে এই নামে ব্র্যান্ড আছে কি না চেক করা (Case-insensitive)
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category: categoryId,
    });

    if (existingBrand) {
      return { success: false, message: "This brand already exists in this category!" };
    }

    // ২. নতুন ব্র্যান্ড তৈরি
    const brand = await Brand.create({ name, category: categoryId });
    revalidatePath("/stock/brands");
    return { success: true, data: JSON.parse(JSON.stringify(brand)) };
  } catch (error: any) {
    return { success: false, message: error.message };
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


export const updateBrandAction = async (id: string, name: string, categoryId: string) => {
  try {
    await connectDB();

    // ১. চেক করা: এই ক্যাটাগরিতে এই নামের অন্য কোনো ব্র্যান্ড আছে কি না (নিজের ID বাদে)
    const existingBrand = await Brand.findOne({
      _id: { $ne: id }, // নিজের আইডি বাদে অন্যগুলো খুঁজবে
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category: categoryId,
    });

    if (existingBrand) {
      return { success: false, message: "Another brand with this name already exists in this category!" };
    }

    // ২. আপডেট করা
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name, category: categoryId },
      { new: true }
    );
    revalidatePath("/stock/brands");
    return { success: true, data: JSON.parse(JSON.stringify(updatedBrand)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};


export const getAllBrandsAction = async (query = "", categoryId = "all", page = 1, limit = 10) => {
  try {
    await connectDB();
    
    // ১. কতগুলো ডাটা স্কিপ করতে হবে তার হিসাব
    const skip = (page - 1) * limit;

    // ২. ডাইনামিক ফিল্টার অবজেক্ট তৈরি
    let filter: any = {};
    
    // যদি সার্চ বক্সে কিছু লেখা হয়
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }
    
    // যদি ড্রপডাউন থেকে নির্দিষ্ট ক্যাটাগরি সিলেক্ট করা হয়
    if (categoryId && categoryId !== "all") {
      filter.category = categoryId;
    }
    
    // ৩. ডাটাবেস থেকে ডাটা আনা (ক্যাটাগরি নামসহ)
    const brands = await Brand.find(filter)
      .populate("category", "name") // Category মডেল থেকে শুধু name টা নিয়ে আসবে
      .sort({ createdAt: -1 })      // নতুন ব্র্যান্ডগুলো উপরে দেখাবে
      .skip(skip)
      .limit(limit);

    // ৪. মোট কতগুলো ব্র্যান্ড আছে (প্যাজিনেশনের জন্য)
    const totalItems = await Brand.countDocuments(filter);

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(brands)), 
      totalItems, 
      totalPages: Math.ceil(totalItems / limit) 
    };
  } catch (error: any) {
    console.error("Get All Brands Error:", error);
    return { 
      success: false, 
      data: [], 
      totalItems: 0, 
      totalPages: 0,
      message: error.message 
    };
  }
};