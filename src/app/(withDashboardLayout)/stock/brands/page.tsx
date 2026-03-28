"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, X, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import Swal from "sweetalert2";
import { getAllCategoriesAction } from "@/services/categoryActions";
import { createBrandAction, getAllBrandsAction, deleteBrandAction } from "@/services/brandActions";
import { motion, AnimatePresence } from "framer-motion";

const BrandClient = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const swalConfig: any = {
    confirmButtonColor: "#f9db3d",
    customClass: { title: "swal-title-black", confirmButton: "swal-confirm-black-text" }
  };

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    const [bRes, cRes] = await Promise.all([
      getAllBrandsAction(searchQuery, currentPage, 6),
      getAllCategoriesAction("", 1, 100)
    ]);
    if (bRes.success) {
      setBrands(bRes.data);
      setTotalPages(bRes.totalPages);
      setTotalItems(bRes.totalItems);
    }
    if (cRes.success) setCategories(cRes.data);
    setInitialLoading(false);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [fetchData]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5"><div className="h-4 w-32 bg-gray-100 rounded-lg"></div></td>
      <td className="px-8 py-5"><div className="h-6 w-24 bg-gray-50 rounded-lg"></div></td>
      <td className="px-8 py-5 text-right"><div className="h-9 w-9 bg-gray-50 rounded-xl ml-auto"></div></td>
    </tr>
  );

  const handleSaveBrand = async () => {
    if (!brandName || !selectedCategory) {
      return Swal.fire({ ...swalConfig, title: "Error", text: "Fill all fields", icon: "error" });
    }
    setLoading(true);
    const res = await createBrandAction(brandName, selectedCategory);
    if (res.success) {
      Swal.fire({ ...swalConfig, icon: "success", title: "Brand Added!" });
      closeModal();
      fetchData();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ ...swalConfig, title: "Delete Brand?", icon: "warning", showCancelButton: true });
    if (result.isConfirmed) {
      await deleteBrandAction(id);
      fetchData();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBrandName("");
    setSelectedCategory("");
    document.body.style.overflow = "unset";
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Tag size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Brand Setup</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Organize brands by category</p>
          </div>
        </div>
        <button onClick={() => { setIsModalOpen(true); document.body.style.overflow = "hidden"; }} className="px-5 py-2.5 bg-[#f9db3d] text-black font-bold rounded-xl shadow-sm flex items-center gap-2 text-sm transition-transform active:scale-95">
          <Plus size={18} /> Add Brand
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search brands..." className={`${inputClass} pl-11 h-full font-medium`} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="bg-black rounded-2xl p-4 flex items-center justify-between text-white border border-gray-800 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Brands</span>
            <span className="text-2xl font-black text-[#f9db3d]">{totalItems}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[460px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-5 font-bold text-gray-800 text-sm uppercase tracking-tight">{brand.name}</td>
                    <td className="px-8 py-5">
                       <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-gray-200">{brand.category?.name}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(brand._id)} className="p-2.5 bg-gray-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-90"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center text-gray-300 text-[11px] font-black uppercase tracking-[0.2em]">Data Not Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 mt-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
          <div className="flex gap-3">
            <button disabled={currentPage === 1 || initialLoading} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20 transition-all hover:bg-gray-50"><ChevronLeft size={20}/></button>
            <button disabled={currentPage === totalPages || totalPages === 0 || initialLoading} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20 transition-all hover:bg-gray-50"><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }} className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative z-10">
              <button onClick={closeModal} className="absolute right-8 top-8 text-gray-300 hover:text-black transition-colors"><X size={28}/></button>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-8">New Brand</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Select Category</label>
                  <select className={inputClass} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Choose Category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Brand Name</label>
                  <input className={inputClass} placeholder="e.g. Samsung" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <button onClick={handleSaveBrand} disabled={loading} className="w-full py-4 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-black uppercase rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                  {loading ? "Processing..." : "Create Brand"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandClient;