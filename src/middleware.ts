import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const { pathname } = req.nextUrl;

    // ১. পাবলিক পেজ লিস্ট (লগইন ছাড়াই ঢোকা যাবে)
    const isPublicPage = pathname.startsWith("/login") || 
                         pathname.startsWith("/forgot-password") || 
                         pathname.startsWith("/reset-password");

    // ২. যদি ইউজার লগইন করা থাকে এবং কোনো পাবলিক পেজে (যেমন /login) যেতে চায়, তাকে ড্যাশবোর্ডে পাঠিয়ে দাও
    if (isPublicPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ৩. যদি ইউজার লগইন করা না থাকে এবং ড্যাশবোর্ডে যেতে চায়, তাকে লগইন পেজে পাঠিয়ে দাও
    // (এটি withAuth নিজে থেকেই করে, তাই এখানে আলাদা লজিক না দিলেও চলে)
    
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

        // বাকি সব পেজের জন্য (যেমন /dashboard) টোকেন মাস্ট
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
    /*
     * ড্যাশবোর্ড এবং অথ পেজগুলো সব এখানে থাকবে, 
     * কিন্তু authorized কলব্যাক ঠিক করবে কে কোথায় ঢুকতে পারবে।
     */
    "/dashboard/:path*",
    "/api/:path*",
    "/login",
    "/forgot-password",
    "/reset-password"
  ],
};