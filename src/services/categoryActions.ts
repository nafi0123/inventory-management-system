"use server";

import Category from "@/app/models/Category";
import { revalidatePath } from "next/cache";
import connectDB from "@/app/lib/db";

export const createCategoryAction = async (name: string, extraFields: string[]) => {
  try {
    await connectDB();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) return { success: false, message: "Category already exists!" };

    const cleanedFields = extraFields.filter((f) => f.trim() !== "");
    await Category.create({ name, extraFields: cleanedFields });
    revalidatePath("/stock/categories");
    return { success: true, message: "Category created successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// Update/Patch Action
export const updateCategoryAction = async (id: string, name: string, extraFields: string[]) => {
  try {
    await connectDB();
    
    // নিজের আইডি বাদে অন্য কারো সাথে নাম মিলছে কি না চেক
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id } 
    });
    if (existing) return { success: false, message: "Category name already exists!" };

    const cleanedFields = extraFields.filter((f) => f.trim() !== "");
    await Category.findByIdAndUpdate(id, { name, extraFields: cleanedFields });
    
    revalidatePath("/stock/categories");
    return { success: true, message: "Category updated successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Update failed" };
  }
};

export const getAllCategoriesAction = async (query = "", page = 1, limit = 6) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const searchFilter = query ? { name: { $regex: query, $options: "i" } } : {};

    const categories = await Category.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(searchFilter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(categories)),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    };
  } catch (error) {
    return { success: false, data: [], totalPages: 0, totalItems: 0 };
  }
};

export const deleteCategoryAction = async (id: string) => {
  try {
    await connectDB();
    await Category.findByIdAndDelete(id);
    revalidatePath("/stock/categories");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};