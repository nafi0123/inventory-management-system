"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  List,
  CalendarCheck,
  Truck,
  Boxes,
  ChevronDown,
} from "lucide-react";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>("customers");

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="w-64 h-screen bg-gray-100 p-4 overflow-y-auto">
      {/* Dashboard */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-200 font-semibold">
        <LayoutDashboard size={20} />
        Dashboard
      </div>

      {/* Customers */}
      <div className="mt-4">
        <button
          onClick={() => toggleMenu("customers")}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-200"
        >
          <div className="flex items-center gap-3">
            <Users size={20} />
            Customers
          </div>
          <ChevronDown
            className={`transition ${
              openMenu === "customers" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openMenu === "customers" && (
          <div className="ml-6 mt-2 space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200">
              <List size={16} />
              All Customers
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200">
              <UserPlus size={16} />
              Add Customer
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200">
              <CalendarCheck size={16} />
              Commitments
            </div>
          </div>
        )}
      </div>

      {/* Suppliers */}
      <div className="mt-4">
        <button
          onClick={() => toggleMenu("suppliers")}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-200"
        >
          <div className="flex items-center gap-3">
            <Truck size={20} />
            Suppliers
          </div>
          <ChevronDown
            className={`transition ${
              openMenu === "suppliers" ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Inventory */}
      <div className="mt-4">
        <button
          onClick={() => toggleMenu("inventory")}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-200"
        >
          <div className="flex items-center gap-3">
            <Boxes size={20} />
            Inventory
          </div>
          <ChevronDown
            className={`transition ${
              openMenu === "inventory" ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;