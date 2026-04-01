"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, X, ChevronLeft, ChevronRight, Tag, Eye, Edit3, Filter } from "lucide-react";
import Swal from "sweetalert2";
import { getAllCategoriesAction } from "@/services/categoryActions";
import { createBrandAction, getAllBrandsAction, deleteBrandAction, updateBrandAction } from "@/services/brandActions";
import { motion, AnimatePresence } from "framer-motion";

const BrandClient = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States for Edit/View
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const [brandName, setBrandName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // SweetAlert Custom Configuration
  const swalConfig: any = {
    confirmButtonColor: "#f9db3d",
    customClass: { 
        title: "swal-title-black", 
        confirmButton: "swal-confirm-black-text" 
    }
  };

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    const [bRes, cRes] = await Promise.all([
      getAllBrandsAction(searchQuery, categoryFilter, currentPage, 6),
      getAllCategoriesAction("", 1, 100)
    ]);
    if (bRes.success) {
      setBrands(bRes.data);
      setTotalPages(bRes.totalPages);
      setTotalItems(bRes.totalItems);
    }
    if (cRes.success) setCategories(cRes.data);
    setInitialLoading(false);
  }, [searchQuery, categoryFilter, currentPage]);

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [fetchData]);

  const handleSaveBrand = async () => {
    if (!brandName || !selectedCategory) {
      return Swal.fire({ ...swalConfig, title: "Error", text: "Fill all fields", icon: "error" });
    }
    setLoading(true);
    
    // সার্ভার অ্যাকশন কল
    const res = editMode && selectedBrandId 
        ? await updateBrandAction(selectedBrandId, brandName, selectedCategory)
        : await createBrandAction(brandName, selectedCategory);

    if (res.success) {
      Swal.fire({ ...swalConfig, icon: "success", title: editMode ? "UPDATED!" : "ADDED!" });
      closeModal();
      fetchData();
    } else {
      // যদি নাম ডুপ্লিকেট হয় বা অন্য কোনো এরর আসে
      Swal.fire({ 
        ...swalConfig, 
        icon: "error", 
        title: "SORRY!", 
        text: res.message || "Something went wrong" 
      });
    }
    setLoading(false);
  };

const handleDelete = async (id: string) => {
  const result = await Swal.fire({
    ...swalConfig,
    title: "ARE YOU SURE?",
    text: "You won't be able to revert this brand!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "YES, DELETE IT!",
    cancelButtonText: "CANCEL",
    reverseButtons: true
  });

  if (result.isConfirmed) {
    const res = await deleteBrandAction(id);
    if (res.success) {
      Swal.fire({ ...swalConfig, title: "DELETED!", icon: "success" });

      // লজিক: যদি এই পেজে মাত্র ১টি আইটেম থাকে এবং আমরা ১ নম্বর পেজের বেশি কোনো পেজে থাকি
      // তবে ডিলিট করার পর এক পেজ পিছিয়ে যাও
      if (brands.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        // অন্যথায় শুধু ডাটা রিফ্রেশ করো
        fetchData();
      }
    } else {
      Swal.fire({ ...swalConfig, title: "ERROR!", text: "Delete failed", icon: "error" });
    }
  }
};
  const openEdit = (brand: any) => {
    setEditMode(true); setViewMode(false); setSelectedBrandId(brand._id);
    setBrandName(brand.name); setSelectedCategory(brand.category?._id || "");
    setIsModalOpen(true);
  };

  const openView = (brand: any) => {
    setViewMode(true); setEditMode(false);
    setBrandName(brand.name); setSelectedCategory(brand.category?.name || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditMode(false); setViewMode(false);
    setBrandName(""); setSelectedCategory(""); setSelectedBrandId(null);
    document.body.style.overflow = "unset";
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all font-bold uppercase";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Tag size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Brand Setup</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Organize brands by category</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-[#f9db3d] text-black font-bold rounded-xl shadow-sm flex items-center gap-2 text-sm transition-transform active:scale-95">
          <Plus size={18} /> Add Brand
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search brands..." className={`${inputClass} pl-11 h-full normal-case font-medium`} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>

        <div className="lg:col-span-4 relative flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200 focus-within:border-[#f9db3d] transition-all">
          <Filter size={16} className="text-gray-400 mr-2" />
          <select className="w-full bg-transparent py-2.5 text-[10px] font-bold uppercase outline-none cursor-pointer" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="lg:col-span-2 bg-black rounded-xl p-3 text-white flex flex-col justify-center text-center border border-gray-800 shadow-md">
            <span className="text-[8px] font-black uppercase opacity-60 tracking-widest leading-tight">Total Brands</span>
            <span className="text-xl font-black text-[#f9db3d] leading-none">{totalItems}</span>
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
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openView(brand)} className="p-2.5 bg-gray-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all active:scale-90"><Eye size={16}/></button>
                        <button onClick={() => openEdit(brand)} className="p-2.5 bg-gray-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-90"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(brand._id)} className="p-2.5 bg-gray-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-90"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center text-gray-300 text-[11px] font-black uppercase tracking-[0.2em]">No Brands Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 mt-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
          <div className="flex gap-3">
            <button disabled={currentPage === 1 || initialLoading} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-20 transition-all hover:bg-gray-50"><ChevronLeft size={20}/></button>
            <button disabled={currentPage === totalPages || totalPages === 0 || initialLoading} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-20 transition-all hover:bg-gray-50"><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }} className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative z-10">
              <button onClick={closeModal} className="absolute right-8 top-8 text-gray-300 hover:text-black transition-colors"><X size={28}/></button>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-8">
                {viewMode ? "Brand Details" : editMode ? "Edit Brand" : "New Brand"}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Category</label>
                  {viewMode ? (
                    <div className="p-3 bg-gray-50 rounded-xl font-bold uppercase text-sm border border-gray-100">{selectedCategory}</div>
                  ) : (
                    <select className={inputClass} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">Choose Category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Brand Name</label>
                  {viewMode ? (
                    <div className="p-3 bg-gray-50 rounded-xl font-bold uppercase text-sm border border-gray-100">{brandName}</div>
                  ) : (
                    <input className={inputClass} placeholder="e.g. Samsung" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                  )}
                </div>
                {!viewMode && (
                  <button onClick={handleSaveBrand} disabled={loading} className="w-full py-4 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-black uppercase rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                    {loading ? "Processing..." : editMode ? "Update Brand" : "Create Brand"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5"><div className="h-4 w-32 bg-gray-100 rounded-lg"></div></td>
      <td className="px-8 py-5"><div className="h-6 w-24 bg-gray-50 rounded-lg"></div></td>
      <td className="px-8 py-5 text-right"><div className="h-9 w-9 bg-gray-50 rounded-xl ml-auto"></div></td>
    </tr>
);

export default BrandClient;