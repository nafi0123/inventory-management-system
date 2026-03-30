"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  UserPlus,
  ChevronDown,
  LogOut,
  X,
  Settings,
  User,
  Tag,
  Truck, // সাপ্লায়ারের জন্য নতুন আইকন
  UserSquare, // অল সাপ্লায়ারের জন্য
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
    if (pathname.includes("stock")) setOpenMenu("inventory");
    if (pathname.includes("customers")) setOpenMenu("customers");
    if (pathname.includes("suppliers")) setOpenMenu("suppliers"); // সাপ্লায়ার চেক
    if (pathname.includes("settings")) setOpenMenu("settings");
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "swal-confirm-btn mx-2",
        cancelButton: "swal-cancel-btn mx-2",
        popup: "rounded-2xl",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        signOut({ callbackUrl: "/login" });
      }
    });
  };

  const activeClass = "bg-[#f9db3d] text-black font-bold shadow-sm scale-[1.02]";
  const normalClass = "text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-300";
  const subActive = "bg-[#f9db3d] text-black font-bold shadow-sm";
  const subNormal = "text-gray-500 hover:text-black hover:bg-gray-50";

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-[100] lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`
        fixed lg:static z-[110] top-0 left-0 h-full 
        w-72 shrink-0 
        flex flex-col bg-white px-4 pb-4 pt-0 shadow-sm border border-gray-100 
        lg:rounded-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo Section */}
        <div className="relative flex items-center justify-between px-4 h-16 lg:h-18 mb-2 border-b border-gray-100/50 shrink-0">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="logo" width={45} height={45} priority className="object-contain" />
            <div className="leading-none">
              <h2 className="font-extrabold text-gray-900 text-lg tracking-tight">Mark Gadget</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 text-gray-400 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${pathname === "/dashboard" ? activeClass : normalClass}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[15px]">Dashboard</span>
          </Link>

          {/* Inventory */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("inventory")}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "inventory" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Package size={20} />
                <span className="text-[15px]">Inventory</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openMenu === "inventory" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "inventory" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                <Link href="/stock/products" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/stock/products" ? subActive : subNormal}`}><Package size={16} /> Products</Link>
                <Link href="/stock/categories" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/stock/categories" ? subActive : subNormal}`}><Layers size={16} /> Categories</Link>
                <Link href="/stock/brands" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/stock/brands" ? subActive : subNormal}`}><Tag size={16} /> Brands</Link>
              </div>
            )}
          </div>

          {/* Suppliers (New Added Section) */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("suppliers")}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "suppliers" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Truck size={20} />
                <span className="text-[15px]">Suppliers</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openMenu === "suppliers" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "suppliers" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                <Link
                  href="/suppliers/all"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm transition-all ${pathname === "/suppliers/all" ? subActive : subNormal}`}
                >
                  <UserSquare size={16} /> All Suppliers
                </Link>
                <Link
                  href="/suppliers/create"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm transition-all ${pathname === "/suppliers/create" ? subActive : subNormal}`}
                >
                  <UserPlus size={16} /> Add Supplier
                </Link>
              </div>
            )}
          </div>

          {/* Customers */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("customers")}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "customers" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Users size={20} />
                <span className="text-[15px]">Customers</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openMenu === "customers" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "customers" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                <Link href="/dashboard/customers/all" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/dashboard/customers/all" ? subActive : subNormal}`}><Users size={16} /> All Customers</Link>
                <Link href="/dashboard/customers/add" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/dashboard/customers/add" ? subActive : subNormal}`}><UserPlus size={16} /> Add Customer</Link>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("settings")}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${openMenu === "settings" ? "text-black font-semibold bg-gray-50" : normalClass}`}
            >
              <div className="flex items-center gap-4">
                <Settings size={20} />
                <span className="text-[15px]">Settings</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openMenu === "settings" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "settings" && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                <Link href="/settings/profile" className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${pathname === "/settings/profile" ? subActive : subNormal}`}><User size={16} /> Profile</Link>
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