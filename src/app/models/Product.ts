import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  originalBarcode: string;
  barcodeId: string;
  category: mongoose.Types.ObjectId; 
  supplier: mongoose.Types.ObjectId; // vendorName এর বদলে Supplier ID
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  brand?: string;
  warranty: number; 
  attributes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, "Product name is required"], 
    trim: true 
  },
  originalBarcode: { 
    type: String, 
    required: [true, "Original Company Barcode is required"],
    trim: true 
  },
  barcodeId: { 
    type: String, 
    required: [true, "Unique Lot ID is required"],
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
  buyingPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  brand: { type: String, default: "Generic" },
  warranty: { type: Number, default: 0 }, 
  attributes: { 
    type: Map, 
    of: String, 
    default: {} 
  }
}, { 
  timestamps: true 
});

ProductSchema.index({ originalBarcode: 1, barcodeId: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);