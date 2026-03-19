import { NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/app/models/User";
import connectDB from "@/app/lib/db";
import { sendResetEmail } from "@/app/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await connectDB();

    const user = await User.findOne({ email });
    console.log("USER:", user);

    if (!user) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15;

    await user.save();

    await sendResetEmail(email, token);

    return NextResponse.json({ message: "Reset link sent" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}