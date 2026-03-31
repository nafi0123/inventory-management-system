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

export const getAllProductsAction = async (page: number = 1, limit: number = 10) => {
  try {
    await connectDB();

    // কতগুলো আইটেম স্কিপ করতে হবে তার হিসাব
    const skip = (page - 1) * limit;

    // ১. ডাটা ফেচ করা (Pagination logic সহ)
    const products = await Product.find()
      .populate("category")
      .populate("supplier")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ২. মোট কতগুলো প্রোডাক্ট আছে তা বের করা (ফ্রন্টএন্ডে টোটাল পেজ দেখানোর জন্য)
    const totalProducts = await Product.countDocuments();

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
    console.error("Fetch Error:", error);
    return { 
      success: false, 
      data: [], 
      message: error.message || "Failed to fetch products" 
    };
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
    
    // ১. মোবাইল টাইপ বের করা
    const currentMobileType = updateData.attributes?.mobileType;

    // ২. গ্লোবাল ফিল্টার তৈরি (Official/Unofficial আলাদা করার জন্য)
    const globalFilter: any = { originalBarcode: updateData.originalBarcode };
    if (currentMobileType) {
      globalFilter["attributes.mobileType"] = currentMobileType;
    }

    // ৩. গ্লোবাল আপডেট: নাম, ব্র্যান্ড, সেলিং প্রাইস এবং অ্যালার্ট লিমিট
    // (সাধারণত অ্যালার্ট লিমিট সব লটে সেম থাকা ভালো, তাই এখানে যোগ করা হয়েছে)
    await Product.updateMany(
      globalFilter,
      { 
        name: updateData.name, 
        brand: updateData.brand, 
        category: updateData.category,
        sellingPrice: Number(updateData.sellingPrice),
        lowStockAlert: Number(updateData.lowStockAlert) // এখানে অ্যালার্ট আপডেট যোগ করা হয়েছে
      }
    );

    // ৪. স্পেসিফিক লট আপডেট
    await Product.findByIdAndUpdate(id, {
        ...updateData,
        buyingPrice: Number(updateData.buyingPrice),
        sellingPrice: Number(updateData.sellingPrice),
        warranty: Number(updateData.warranty),
        lowStockAlert: Number(updateData.lowStockAlert), // এখানেও নিশ্চিত করা হয়েছে
        stock: updateData.hasIMEI ? updateData.imeiNumbers.length : Number(updateData.stock)
    });

    revalidatePath("/stock/products");
    return { 
      success: true, 
      message: "Product and Alert Limit updated successfully!" 
    };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: error.message };
  }
};