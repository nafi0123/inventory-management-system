import mongoose, { Schema, Document } from 'mongoose';

/**
 * Product Interface
 * brand কে string থেকে mongoose.Types.ObjectId এ পরিবর্তন করা হয়েছে 
 * যাতে এটি Brand কালেকশনের সাথে যুক্ত হতে পারে।
 */
export interface IProduct extends Document {
  name: string;
  originalBarcode: string;
  barcodeId: string;
  category: mongoose.Types.ObjectId; 
  supplier: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId; // ObjectId ব্যবহার করা হয়েছে
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number;
  warranty: number; 
  hasIMEI: boolean;
  imeiNumbers: string[];
  attributes: Map<string, string>;
}

const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, "Product name is required"], 
    trim: true 
  },
  originalBarcode: { 
    type: String, 
    required: true, 
    trim: true 
  },
  barcodeId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  }, 
  supplier: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: [true, "Supplier is required"] 
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, "Category is required"] 
  },
  /**
   * Brand Dropdown Logic:
   * এখানে ref: 'Brand' দেওয়া হয়েছে। 
   * ড্রপডাউনে ডাটা দেখানোর সময় আপনাকে Brand.find() করে ডাটা আনতে হবে।
   */
  brand: { 
    type: Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: [true, "Brand is required"] 
  },
  buyingPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  sellingPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  stock: { 
    type: Number, 
    default: 0 
  },
  lowStockAlert: { 
    type: Number, 
    default: 5 
  },
  warranty: { 
    type: Number, 
    default: 0 
  }, 
  hasIMEI: { 
    type: Boolean, 
    default: false 
  },
  imeiNumbers: [{ 
    type: String, 
    sparse: true 
  }], 
  attributes: { 
    type: Map, 
    of: String, 
    default: {} 
  }
}, { timestamps: true });

// ইনডেক্সিং (সার্চিং ফাস্ট করার জন্য)
ProductSchema.index({ name: 'text', barcodeId: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);