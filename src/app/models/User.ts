import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" },
},{ timestamps: true });

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);