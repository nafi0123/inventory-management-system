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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.username || !credentials?.password) return null;

        const user = await User.findOne({
          username: credentials.username,
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // default 1 day
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days cookie
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };