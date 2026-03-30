"use server";
import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { revalidatePath } from "next/cache";

export const getProductInfoFromAIAction = async (barcode: string) => {
  console.log(`🚀 Scanning for Barcode: ${barcode}`);

  try {
    // ১. প্রথমে একটি ফ্রি গ্লোবাল ডাটাবেজ ট্রাই করি (এটি অনেক ফাস্ট)
    const upcUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
    const upcRes = await fetch(upcUrl);
    const upcData = await upcRes.json();

    if (upcData.code === "OK" && upcData.items.length > 0) {
      const item = upcData.items[0];
      console.log("✅ Found in Global DB:", item.title);
      
      // টাইটেল থেকে RAM/ROM খুঁজে বের করার লজিক
      const title = item.title;
      const ramMatch = title.match(/(\d+\s*GB)\s*RAM/i);
      const romMatch = title.match(/(\d+\s*GB)\s*(Storage|ROM|GB)/i);

      return {
        success: true,
        data: {
          name: title,
          brand: item.brand || "Generic",
          specs: {
            RAM: ramMatch ? ramMatch[1] : "",
            ROM: romMatch ? romMatch[1] : ""
          }
        }
      };
    }

    // ২. যদি গ্লোবাল ডাটাবেজে না পাওয়া যায়, তবেই জেমিনি ট্রাই করবে
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Product for barcode ${barcode}. Return ONLY JSON: {"name":"...", "brand":"...", "specs":{"RAM":"...", "ROM":"..."}}` }] }]
        })
      });
      const result = await geminiRes.json();
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        const cleanedData = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
        return { success: true, data: cleanedData };
      }
    }

  } catch (error: any) {
    console.error("❌ Identification Error:", error.message);
  }

  // সব ফেল করলে খালি অবজেক্ট দিবে যাতে ম্যানুয়াল ইনপুট দেয়া যায়
  return { success: true, data: { name: "", brand: "", specs: {} }, isManual: true };
};
/**
 * ২. ডাটাবেজ থেকে বারকোড চেক করা
 */
export const getProductByCodeAction = async (code: string) => {
  try {
    await connectDB();
    const product = await Product.findOne({ 
      $or: [{ barcodeId: code }, { originalBarcode: code }] 
    }).sort({ createdAt: -1 }).populate("category");
    
    return { success: true, data: product ? JSON.parse(JSON.stringify(product)) : null };
  } catch (error: any) { 
    return { success: false, message: error.message }; 
  }
};

/**
 * ৩. নতুন প্রোডাক্ট এন্ট্রি (Lot Management)
 */
export const createProductAction = async (productData: any) => {
  try {
    await connectDB();
    const { originalBarcode } = productData;
    
    // লট কাউন্ট বের করা যাতে Barcode-L1, L2 তৈরি করা যায়
    const lotCount = await Product.countDocuments({ originalBarcode });
    const newLotId = `${originalBarcode}-L${lotCount + 1}`;

    await Product.create({ ...productData, barcodeId: newLotId });
    revalidatePath("/stock/products");
    
    return { success: true, message: `Product saved as Lot ${newLotId}` };
  } catch (error: any) { 
    return { success: false, message: error.message }; 
  }
};

/**
 * ৪. সব প্রোডাক্ট গেট করা (With Pagination & Filter)
 */
export const getAllProductsAction = async (query = "", category = "", page = 1, limit = 10) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    let filter: any = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } }, 
        { originalBarcode: { $regex: query, $options: "i" } }
      ];
    }
    
    if (category) filter.category = category;
    
    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Product.countDocuments(filter);
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(products)), 
      totalPages: Math.ceil(total / limit) 
    };
  } catch (error) { 
    return { success: false, data: [], totalPages: 0 }; 
  }
};

/**
 * ৫. প্রোডাক্ট ডিলিট করা
 */
export const deleteProductAction = async (id: string) => {
  try {
    await connectDB();
    await Product.findByIdAndDelete(id);
    revalidatePath("/stock/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) { 
    return { success: false, message: error.message }; 
  }
};