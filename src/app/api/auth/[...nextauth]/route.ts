import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import { User } from "@/app/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please enter both identifier and password");
        }

        // username অথবা email দিয়ে ইউজার খোঁজা হচ্ছে
        const user = await User.findOne({
          $or: [
            { username: credentials.identifier },
            { email: credentials.identifier },
          ],
        });

        if (!user) {
          throw new Error("No user found with this username/email");
        }

        // পাসওয়ার্ড ভেরিফিকেশন (bcryptjs ব্যবহার করা হয়েছে)
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // সেশনের জন্য ডাটা রিটার্ন
        return {
          id: user._id.toString(),
          username: user.username,
          role: user.role || "admin",
          email: user.email || "",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // ১ দিন
  },

  pages: {
    signIn: "/login",
    error: "/login", // এরর হলে লগইন পেজেই থাকবে
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };