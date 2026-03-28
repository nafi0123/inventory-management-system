"use server";
import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { revalidatePath } from "next/cache";

export const createProductAction = async (productData: any) => {
  try {
    await connectDB();
    
    // attributes ফিল্ডটি নিশ্চিত করা
    const finalData = {
      ...productData,
      attributes: productData.attributes || {}
    };

    await Product.create(finalData);
    revalidatePath("/stock/products");
    return { success: true, message: "Product created successfully!" };
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

export const getAllProductsAction = async (query = "", category = "", page = 1, limit = 8) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    
    let filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { universalCode: { $regex: query, $options: "i" } }
      ];
    }
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    };
  } catch (error) {
    return { success: false, data: [], totalPages: 0, totalItems: 0 };
  }
};


export const deleteProductAction = async (id: string) => {
  try {
    await connectDB();
    await Product.findByIdAndDelete(id);
    revalidatePath("/stock/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};