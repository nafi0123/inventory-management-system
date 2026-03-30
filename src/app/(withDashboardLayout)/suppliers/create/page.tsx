"use client";

import React, { useState } from "react";
import { Truck, User, Phone, Mail, MapPin, Building2 } from "lucide-react";
import Swal from "sweetalert2";
import { createSupplierAction } from "@/services/supplierActions";
import { useRouter } from "next/navigation";

const AddSuppliers = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Camel Case ফরম্যাটার
  const formatName = (value: string) => {
    if (!value) return "";
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "name" || name === "companyName") {
      // টাইপ করার সময় রিয়েল-টাইম ফরম্যাট
      setFormData({ ...formData, [name]: formatName(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const res = await createSupplierAction(formData);
    setLoading(false);

    if (res.success) {
      Swal.fire({ 
        icon: "success", 
        title: "Added!", 
        text: "Supplier has been successfully registered.", 
        confirmButtonColor: "#f9db3d",
        customClass: { confirmButton: "swal-confirm-black-text" }
      });
      router.push("/suppliers/all");
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.message });
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all font-bold text-gray-700";
  const labelClass = "block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";
  const btnClass = "w-full md:w-auto px-10 py-3 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center";

  return (
    <div className="space-y-6 pb-10 mt-2">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Supplier Information</h3>
            <p className="text-xs text-gray-400">Register a new vendor for your inventory management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Name */}
            <div>
              <label className={labelClass}>Supplier Name *</label>
              <div className="relative">
                <input 
                  name="name" 
                  type="text" 
                  placeholder="Enter full name" 
                  className={inputClass} 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
                <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {/* Company Name (Optional) */}
            <div>
              <label className={labelClass}>Company Name (Optional)</label>
              <div className="relative">
                <input 
                  name="companyName" 
                  type="text" 
                  placeholder="e.g. Asus Global" 
                  className={inputClass} 
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
                <Building2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number *</label>
              <div className="relative">
                <input 
                  name="phone" 
                  type="text" 
                  placeholder="01XXXXXXXXX" 
                  className={inputClass} 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                />
                <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <input 
                  name="email" 
                  type="email" 
                  placeholder="vendor@company.com" 
                  className={inputClass} 
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Address (Full width grid) */}
          <div>
            <label className={labelClass}>Office Address</label>
            <div className="relative">
              <input 
                name="address" 
                placeholder="City, Area, Road" 
                className={inputClass} 
                value={formData.address}
                onChange={handleInputChange}
              />
              <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? "Registering..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSuppliers;