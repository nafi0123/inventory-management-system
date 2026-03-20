"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import connectDB from "@/app/lib/db";
import { User } from "@/app/models/User";
import bcrypt from "bcryptjs";

// --- ১. ইউজারনেম আপডেট করার জন্য ---
export async function updateUsernameAction(newUsername: string, currentPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    
    // চেক করা হচ্ছে ইউজার লগইন করা কি না
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized! Please login again." };
    }

    await connectDB();
    const userId = (session.user as any).id;

    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found." };

    // পাসওয়ার্ড ভেরিফিকেশন (খুবই জরুরি)
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { success: false, message: "Incorrect current password!" };

    // আপডেট
    user.username = newUsername;
    await user.save();

    return { success: true, message: "Username updated successfully!" };
  } catch (error) {
    return { success: false, message: "Something went wrong." };
  }
}

// --- ২. পাসওয়ার্ড আপডেট করার জন্য ---
export async function updatePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, message: "Unauthorized" };

    await connectDB();
    const userId = (session.user as any).id;

    const user = await User.findById(userId);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { success: false, message: "Old password is wrong!" };

    // নতুন পাসওয়ার্ড হ্যাশ করে সেভ করা
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password changed successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to update password." };
  }
}