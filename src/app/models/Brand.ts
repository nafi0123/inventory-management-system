import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
}

const BrandSchema = new Schema<IBrand>({
  name: { 
    type: String, 
    required: [true, "Brand name is required"],
    trim: true 
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, "Category is required for a brand"] 
  }
}, { timestamps: true });

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);