"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Boxes,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/img/MARK-GADGETS.png";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pathname.includes("customers")) setOpenMenu("customers");
    if (pathname.includes("inventory")) setOpenMenu("inventory");
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const activeClass = "bg-[#f9db3d] text-black font-bold shadow-md scale-[1.02]";
  const normalClass =
    "text-gray-500 hover:bg-white hover:text-black transition-all duration-300";

  return (
    <>
      {/* 🔥 Mobile Navbar (unchanged) */}
      <div
        className="lg:hidden fixed top-2 left-2 right-2 z-40 
        bg-white/80 backdrop-blur-md 
        px-4 py-3 flex items-center justify-between 
        border border-gray-200 rounded-2xl"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-[15px] font-semibold tracking-wide">
          Dashboard
        </h1>

        <div className="w-8" />
      </div>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static z-50 top-0 left-0 h-full
        w-72 md:w-64
        flex flex-col bg-white p-2 shadow-sm border border-gray-100

        rounded-none lg:rounded-[2.5rem]

        transform transition-all duration-300 ease-out

        ${
          isOpen
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-full opacity-0 scale-95"
        }

        lg:translate-x-0 lg:opacity-100 lg:scale-100
      `}
      >
        {/* ✅ Centered Logo */}
        <div className="relative flex items-center justify-center p-4 border-b border-gray-100">
          <Image src={logo} alt="logo" width={120} height={45} />

          {/* Close button (mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-4 p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-3 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${
              pathname === "/dashboard" ? activeClass : normalClass
            }`}
          >
            <LayoutDashboard size={22} />
            <span className="text-[16px]">Dashboard</span>
          </Link>

          {/* Customers */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("customers")}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${
                openMenu === "customers"
                  ? "text-black font-semibold bg-white/40"
                  : normalClass
              }`}
            >
              <div className="flex items-center gap-4">
                <Users size={22} />
                <span className="text-[16px]">Customers</span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  openMenu === "customers" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openMenu === "customers" && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/dashboard/customers/all"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${
                    pathname === "/dashboard/customers/all"
                      ? "bg-[#f9db3d]/20 text-black font-bold"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  All Customers
                </Link>

                <Link
                  href="/dashboard/customers/add"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm ${
                    pathname === "/dashboard/customers/add"
                      ? "bg-[#f9db3d]/20 text-black font-bold"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  Add Customer
                </Link>
              </div>
            )}
          </div>

          {/* Inventory */}
          <button
            onClick={() => toggleMenu("inventory")}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${
              openMenu === "inventory"
                ? "text-black font-semibold bg-white/40"
                : normalClass
            }`}
          >
            <div className="flex items-center gap-4">
              <Boxes size={22} />
              <span className="text-[16px]">Inventory</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "inventory" ? "rotate-180" : ""
              }`}
            />
          </button>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200/50 mt-auto">
 <button 
  onClick={() => signOut({ callbackUrl: "/login" })} 
  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-semibold"
>
  <LogOut size={22} />
  <span className="text-[16px]">Logout</span>
</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;