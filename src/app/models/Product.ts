import mongoose, { Schema, Document } from 'mongoose';

// ১. TypeScript Interface definition
export interface IProduct extends Document {
  name: string;
  universalCode: string; 
  category: mongoose.Types.ObjectId; 
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  brand?: string;
  warranty: number; 
  attributes: Map<string, string>; // ডাইনামিক ফিল্ডগুলো (RAM, ROM ইত্যাদি) স্টোর করার জন্য
  createdAt: Date;
  updatedAt: Date;
}

// ২. Mongoose Schema definition
const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, "Product name is required"],
    trim: true 
  },
  universalCode: { 
    type: String, 
    required: [true, "Universal Code or SKU is required"],
    unique: true, // একই কোড দুইবার সেভ হবে না
    trim: true 
  }, 
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', // Category মডেলের সাথে রিলেশন
    required: [true, "Category is required"] 
  },
  buyingPrice: { 
    type: Number, 
    required: [true, "Buying price is required"],
    min: 0 
  },
  sellingPrice: { 
    type: Number, 
    required: [true, "Selling price is required"],
    min: 0 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  brand: { 
    type: String, 
    default: "Generic" 
  },
  
  // ওয়ারেন্টি পিরিয়ড (মাসের হিসেবে), ডিফল্ট ০
  warranty: { 
    type: Number, 
    default: 0 
  }, 

  // ক্যাটাগরি অনুযায়ী ডাইনামিক ফিল্ডগুলো এখানে অবজেক্ট আকারে থাকবে
  attributes: {
    type: Map,
    of: String,
    default: {}
  }
}, { 
  timestamps: true // অটোমেটিক createdAt এবং updatedAt ফিল্ড তৈরি করবে
});

// ৩. Model export (Next.js এর জন্য hot reload হ্যান্ডেল করা হয়েছে)
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);