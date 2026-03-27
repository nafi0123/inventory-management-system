// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  universalCode: string; 
  category: mongoose.Types.ObjectId; 
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  brand?: string;
  warranty: number; // Months hishebe (e.g., 6 mane 6 month)
  
  attributes: Map<string, string>; 
  serialNumbers?: string[]; 
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  universalCode: { type: String, required: true }, 
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  brand: { type: String, default: "Generic" },
  
  // Ekhane default 0 thakbe
  warranty: { type: Number, default: 0 }, 

  attributes: {
    type: Map,
    of: String,
    default: {}
  },

  serialNumbers: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);