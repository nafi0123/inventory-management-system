import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const { pathname } = req.nextUrl;

    const isPublicPage = pathname.startsWith("/login") || 
                         pathname.startsWith("/forgot-password") || 
                         pathname.startsWith("/reset-password");

    if (isPublicPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // এই পেজগুলোর জন্য কোনো টোকেন বা লগইন লাগবে না (Public Access)
        if (
          pathname.startsWith("/login") || 
          pathname.startsWith("/forgot-password") || 
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/api/auth") // Next-Auth এর নিজস্ব API গুলোও পাবলিক রাখতে হবে
        ) {
          return true; 
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
  
    "/dashboard/:path*",
    "/stock/:path*",
    "/settings/:path*",
    "/api/:path*",
    "/login",
    "/forgot-password",
    "/reset-password"
  ],
};