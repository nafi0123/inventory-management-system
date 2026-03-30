import mongoose, { Schema, model, models } from "mongoose";

const SupplierSchema = new Schema(
  {
    name: { 
        type: String, 
        required: [true, "Supplier name is required"], 
        trim: true 
    },
    companyName: { 
        type: String, 
        trim: true,
        default: "N/A" // অপশনাল করে দেওয়া হলো
    },
    phone: { 
        type: String, 
        required: [true, "Phone number is required"], 
        trim: true 
    },
    email: { 
        type: String, 
        trim: true 
    },
    address: { 
        type: String, 
        trim: true 
    },
  },
  { timestamps: true }
);

export default models.Supplier || model("Supplier", SupplierSchema);