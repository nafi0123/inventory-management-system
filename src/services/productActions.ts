"use server";
import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { revalidatePath } from "next/cache";

export const getProductByCodeAction = async (code: string) => {
  try {
    await connectDB();
    const product = await Product.findOne({ 
      $or: [
        { barcodeId: code }, 
        { originalBarcode: code },
        { imeiNumbers: code } // Eita add kora holo IMEI check-er jonno
      ] 
    }).sort({ createdAt: -1 }).populate("category");
    
    return { 
      success: true, 
      data: product ? JSON.parse(JSON.stringify(product)) : null 
    };
  } catch (error: any) { 
    return { success: false, message: error.message }; 
  }
};


export const createProductAction = async (productData: any) => {
  try {
    await connectDB();
    const { originalBarcode, imeiNumbers } = productData;

    // ১. আরও সিকিউর লট আইডি জেনারেশন (Timestamp যোগ করা হয়েছে যাতে ডুপ্লিকেট না হয়)
    const lastLot = await Product.findOne({ originalBarcode })
      .sort({ createdAt: -1 })
      .select("barcodeId");

    let nextLotNumber = 1;
    if (lastLot && lastLot.barcodeId.includes("-L")) {
      const parts = lastLot.barcodeId.split("-L");
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) {
        nextLotNumber = lastNum + 1;
      }
    }

    // বারকোড আইডিটি ইউনিক করার জন্য লট নাম্বারের সাথে প্রয়োজন হলে র‍্যান্ডম স্ট্রিং বা টাইমস্ট্যাম্প দিতে পারেন
    const newLotId = `${originalBarcode}-L${nextLotNumber}`;

    // ২. ডুপ্লিকেট IMEI চেক (এটি রাখা জরুরি, কারণ একই ফোন দুইবার এন্ট্রি হওয়া উচিত নয়)
    if (productData.hasIMEI && imeiNumbers && imeiNumbers.length > 0) {
      const exists = await Product.findOne({ imeiNumbers: { $in: imeiNumbers } });
      if (exists) return { success: false, message: "One or more IMEI already exists in stock!" };
    }

    const product = await Product.create({ 
      ...productData, 
      barcodeId: newLotId,
      stock: productData.hasIMEI ? imeiNumbers.length : Number(productData.stock)
    });

    revalidatePath("/stock/products");
    return { success: true, message: `Lot ${nextLotNumber} added successfully!` };
  } catch (error: any) {
    // ডাটাবেজ লেভেলে যদি এখনও ইউনিক ইনডেক্স থাকে তবে এই এরর আসবে
    if (error.code === 11000) {
      return { success: false, message: "Database Error: Duplicate key detected. Please check your DB indexes." };
    }
    return { success: false, message: error.message || "Failed to save product." };
  }
};

export const getAllProductsAction = async (
  page: number = 1, 
  limit: number = 10, 
  filters: any = {} // ফিল্টার প্যারামিটার যোগ করা হলো
) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    // ফিল্টার কুয়েরি তৈরি
    let query: any = {};
    
    if (filters.category && filters.category !== "all") query.category = filters.category;
    if (filters.condition && filters.condition !== "all") query.condition = filters.condition;
    
    // Official/Unofficial ফিল্টার (আপনার attributes-এর ভেতর থাকলে)
    if (filters.type && filters.type !== "all") {
      query["attributes.mobileType"] = filters.type;
    }

    const products = await Product.find(query) // কুয়েরি অ্যাপ্লাই করা হলো
      .populate("category")
      .populate("supplier")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query); // ফিল্টার অনুযায়ী টোটাল কাউন্ট

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      meta: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
    };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
};




export const deleteProductAction = async (id: string) => {
  try { 
    await connectDB(); 
    await Product.findByIdAndDelete(id); 
    
    // নির্দিষ্ট পাথ এবং পুরো লেআউট রিভ্যালিডেট করুন যাতে ক্যাশ ক্লিয়ার হয়
    revalidatePath("/stock/products", "page"); 
    return { success: true }; 
  }
  catch (error) { 
    return { success: false, message: "Delete failed" }; 
  }
};

export const updateProductAction = async (id: string, updateData: any) => {
  try {
    await connectDB();
    
    // ১. মোবাইল টাইপ এবং কন্ডিশন বের করা
    const currentMobileType = updateData.attributes?.mobileType;
    const currentCondition = updateData.condition; // 'New' অথবা 'Used'

    // ২. গ্লোবাল ফিল্টার তৈরি (Condition-ভিত্তিক আলাদা করার জন্য)
    const globalFilter: any = { 
      originalBarcode: updateData.originalBarcode,
      condition: currentCondition // শুধু একই কন্ডিশনের প্রোডাক্টগুলো ফিল্টার করবে
    };

    // যদি মোবাইল টাইপ থাকে (Official/Unofficial), তবে সেটিও ফিল্টারে যোগ হবে
    if (currentMobileType) {
      globalFilter["attributes.mobileType"] = currentMobileType;
    }

    // ৩. গ্লোবাল আপডেট: (একই বারকোড + একই কন্ডিশন + একই টাইপ) হলে সব লটে আপডেট হবে
    await Product.updateMany(
      globalFilter,
      { 
        name: updateData.name, 
        brand: updateData.brand, 
        category: updateData.category,
        sellingPrice: Number(updateData.sellingPrice),
        lowStockAlert: Number(updateData.lowStockAlert)
      }
    );

    // ৪. নির্দিষ্ট লট আপডেট (ID অনুযায়ী)
    await Product.findByIdAndUpdate(id, {
        ...updateData,
        buyingPrice: Number(updateData.buyingPrice),
        sellingPrice: Number(updateData.sellingPrice),
        warranty: Number(updateData.warranty),
        lowStockAlert: Number(updateData.lowStockAlert),
        // IMEI থাকলে স্টক অটোমেটিক ক্যালকুলেট হবে, নাহলে ইনপুট ভ্যালু নিবে
        stock: updateData.hasIMEI ? updateData.imeiNumbers.length : Number(updateData.stock)
    });

    revalidatePath("/stock/products");
    
    return { 
      success: true, 
      message: `Product (${currentCondition}) updated successfully!` 
    };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: error.message };
  }
};