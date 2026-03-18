import connectDB from "@/app/lib/db";
import bcrypt from "bcryptjs"; // এখানে 'bcrypt' এর বদলে 'bcryptjs' দিন
import { User } from "@/app/models/User";
import dotenv from "dotenv";

dotenv.config(); // এটি অবশ্যই থাকতে হবে যাতে .env থেকে MONGODB_URI পায়

const seed = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Admin created successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seed();