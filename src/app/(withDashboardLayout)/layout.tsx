"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { User, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  // console.log(se)

  const titleMap: Record<string, string> = {
    "/dashboard": "Overview Dashboard",
    "/dashboard/customers/all": "Customer Directory",
    "/dashboard/customers/add": "Register New Customer",
    "/dashboard/inventory": "Product Inventory",
    "/settings/profile": "Profile Settings",
  };

  const getPageLabel = () => {
    if (titleMap[pathname]) return titleMap[pathname];
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "Dashboard";
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] lg:p-4 gap-4 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col gap-4 min-w-0 h-full p-3 lg:p-0">
        
        <header className="
          bg-white 
          h-16 lg:h-18 
          rounded-2xl lg:rounded-2xl 
          flex items-center justify-between 
          px-4 lg:px-10 
          shadow-sm border border-gray-100 
          shrink-0
        ">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            >
              <Menu size={22} />
            </button>

            {/* --- Dynamic Page Label with Custom Titles --- */}
            <div className="hidden lg:block leading-tight border-r border-gray-100 pr-6 mr-2">
                <h2 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                  {getPageLabel()}
                </h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  Management System
                </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-bold text-green-700 uppercase">System Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-gray-100">
            <div className="text-right hidden md:block">
              <p className="text-[12px] font-black text-gray-900 leading-none">
                {session?.user?.email || "admin@markgadgets.com"}
              </p>
                  <p className="text-[9px] text-amber-600 font-black  mt-1 tracking-wider">
      {/* এখানে ইমেইল এর বদলে ইউজারনেম দেখাচ্ছি এবং টাইপ এরর হ্যান্ডেল করছি */}
      {(session?.user as any)?.username || "Admin User"}
    </p>
              {/* <p className="text-[9px] text-amber-600 font-black uppercase mt-1 tracking-wider">{session?.user?.username || "Admin"}</p> */}
            </div>
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-amber-50 flex items-center justify-center border-2 border-white shadow-md ring-1 ring-amber-200">
              <User size={22} className="text-amber-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white rounded-2xl lg:rounded-2xl p-5 lg:p-10 shadow-sm border border-gray-100 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}