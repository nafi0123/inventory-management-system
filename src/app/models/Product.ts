import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  originalBarcode: string;
  barcodeId: string;
  category: mongoose.Types.ObjectId; 
  supplier: mongoose.Types.ObjectId;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number; // নতুন ফিল্ড
  brand?: string;
  warranty: number; 
  hasIMEI: boolean;
  imeiNumbers: string[];
  attributes: Map<string, string>;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  originalBarcode: { type: String, required: true, trim: true },
  barcodeId: { type: String, required: true, unique: true, trim: true }, 
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  buyingPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  lowStockAlert: { type: Number, default: 5 }, // ডিফল্ট ৫ পিস
  brand: { type: String, default: "Generic" },
  warranty: { type: Number, default: 0 }, 
  hasIMEI: { type: Boolean, default: false },
  imeiNumbers: [{ type: String, sparse: true }], 
  attributes: { type: Map, of: String, default: {} }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);