"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  LogOut,
  X,
  Settings,
  User,
} from "lucide-react";
import logo from "@/assets/img/MARK-GADGETS.png";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.includes("customers")) setOpenMenu("customers");
    if (pathname.includes("inventory")) setOpenMenu("inventory");
    if (pathname.includes("settings")) setOpenMenu("settings");
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // --- UPDATED LOGOUT LOGIC ---
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false, // Default styling বন্ধ করা হয়েছে কাস্টম CSS ব্যবহারের জন্য
      customClass: {
        confirmButton: "swal-confirm-btn mx-2", // Custom CSS Class
        cancelButton: "swal-cancel-btn mx-2",   // Custom CSS Class
        popup: "rounded-2xl" // পপআপটিও রাউন্ডেড করার জন্য
      }
    }).then((result) => {
      if (result.isConfirmed) {
        signOut({ callbackUrl: "/login" });
      }
    });
  };

  const activeClass = "bg-[#f9db3d] text-black font-bold shadow-sm scale-[1.02]";
  const normalClass = "text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-300";

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/40 z-[100] lg:hidden backdrop-blur-sm transition-opacity" 
        />
      )}

      <aside className={`
        fixed lg:static z-[110] top-0 left-0 h-full 
        w-72 shrink-0 
        flex flex-col bg-white px-4 pb-4 pt-0 shadow-sm border border-gray-100 
        lg:rounded-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Logo Section */}
        <div className="relative flex items-center justify-between px-4 h-16 lg:h-18 mb-2 border-b border-gray-100/50 shrink-0">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="logo" width={45} height={45} priority className="object-contain" />
            <div className="leading-none">
              <h2 className="font-extrabold text-gray-900 text-lg tracking-tight">Mark Gadget</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} 
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${pathname === "/dashboard" ? activeClass : normalClass}`}>
            <LayoutDashboard size={20} />
            <span className="text-[15px]">Dashboard</span>
          </Link>

          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu("customers")} 
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "customers" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Users size={20} />
                <span className="text-[15px]">Customers</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openMenu === "customers" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "customers" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2 text-sm text-gray-500">
                <Link href="/dashboard/customers/all" onClick={() => setIsOpen(false)} className="block px-6 py-2 hover:text-black">All Customers</Link>
                <Link href="/dashboard/customers/add" onClick={() => setIsOpen(false)} className="block px-6 py-2 hover:text-black">Add Customer</Link>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu("settings")} 
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "settings" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Settings size={20} />
                <span className="text-[15px]">Settings</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openMenu === "settings" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "settings" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                <Link href="/settings/profile" onClick={() => setIsOpen(false)} 
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/settings/profile" ? activeClass : "text-gray-500 hover:text-black"}`}>
                  <User size={16} /> Profile
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-50 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold">
            <LogOut size={20} />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;