// src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  extraFields: string[]; // Ekhane field-er name thakbe: ["RAM", "Color", "Length"]
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  extraFields: [{ type: String }] 
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);