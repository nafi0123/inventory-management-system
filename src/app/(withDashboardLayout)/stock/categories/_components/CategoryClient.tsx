"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Edit3, LayoutGrid, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { createCategoryAction, getAllCategoriesAction, deleteCategoryAction, updateCategoryAction } from "@/services/categoryActions";
import { motion, AnimatePresence } from "framer-motion";

const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-gray-50">
        <td className="px-8 py-5">
          <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-50 rounded w-20" />
        </td>
        <td className="px-8 py-5">
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 rounded-lg w-16" />
            <div className="h-6 bg-gray-100 rounded-lg w-16" />
          </div>
        </td>
        <td className="px-8 py-5 text-right">
          <div className="flex justify-end gap-2">
            <div className="h-9 w-9 bg-gray-50 rounded-xl" />
            <div className="h-9 w-9 bg-gray-50 rounded-xl" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

const CategoryClient = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extraFields, setExtraFields] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  // Global Swal Config for this component
  const swalConfig: any = {
    confirmButtonColor: "#f9db3d",
    customClass: {
      title: "swal-title-black",
      htmlContainer: "swal-text-black",
      confirmButton: "swal-confirm-black-text"
    }
  };

  const fetchCategories = useCallback(async () => {
    setInitialLoading(true);
    const res = await getAllCategoriesAction(searchQuery, currentPage, itemsPerPage);
    if (res.success) {
      setCategories(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    }
    setInitialLoading(false);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchCategories(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCategories]);

  const handleEditClick = (cat: any) => {
    setEditingId(cat._id);
    setCategoryName(cat.name);
    setExtraFields(cat.extraFields);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleSaveCategory = async () => {
    if (!categoryName) {
      return Swal.fire({ 
        ...swalConfig,
        title: "Error", 
        text: "Name is required", 
        icon: "error" 
      });
    }
    setLoading(true);
    
    const res = editingId 
      ? await updateCategoryAction(editingId, categoryName, extraFields)
      : await createCategoryAction(categoryName, extraFields);

    if (res.success) {
      Swal.fire({ 
        ...swalConfig,
        icon: "success", 
        title: editingId ? "Updated!" : "Saved!" 
      });
      closeModal();
      fetchCategories();
    } else {
      Swal.fire({ 
        ...swalConfig,
        icon: "error", 
        title: "Error", 
        text: res.message 
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      ...swalConfig,
      title: "Are you sure?",
      text: "All products might be affected!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      const res = await deleteCategoryAction(id);
      if (res.success) { 
        fetchCategories(); 
        Swal.fire({ ...swalConfig, title: "Deleted!", icon: "success" }); 
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setExtraFields([]);
    setEditingId(null);
    document.body.style.overflow = "unset";
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Category Setup</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage dynamic product fields</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Link href="/stock/products" className="px-5 py-2.5 bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm">
              View Products <ArrowRight size={14} />
            </Link>
            <button onClick={() => { setIsModalOpen(true); document.body.style.overflow = "hidden"; }} className="px-5 py-2.5 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm">
              <Plus size={18} /> Add Category
            </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search..." className={`${inputClass} pl-11 h-full font-medium`} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="bg-black rounded-2xl p-4 flex items-center justify-between text-white border border-gray-800 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Categories</span>
            <span className="text-2xl font-black text-[#f9db3d]">{totalItems}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[460px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Detail</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Extra Fields</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialLoading ? <TableSkeleton /> : categories.length > 0 ? categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">{cat.name}</span>
                    <span className="block text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">ID: {cat._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {cat.extraFields.length > 0 ? cat.extraFields.map((f: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-gray-200">{f}</span>
                      )) : <span className="text-gray-300 text-[10px] italic">No Extra Specs</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => handleEditClick(cat)} className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-50 transition-all active:scale-90"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(cat._id)} className="p-2.5 bg-gray-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-90"><Trash2 size={16}/></button>
                  </td>
                </tr>
              )) : (
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
            <button disabled={currentPage === 1 || initialLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20"><ChevronLeft size={20} /></button>
            <button disabled={currentPage === totalPages || totalPages === 0 || initialLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative z-10">
              <button onClick={closeModal} className="absolute right-8 top-8 text-gray-300 hover:text-black"><X size={28}/></button>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-8">{editingId ? "Update Category" : "New Category"}</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Category Name</label>
                  <input className={inputClass} placeholder="e.g. Smart Watch" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Custom Spec Fields</label>
                    <button onClick={() => setExtraFields([...extraFields, ""])} className="text-[9px] bg-black text-[#f9db3d] px-4 py-2 rounded-xl font-black uppercase">+ Add Field</button>
                  </div>
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                    {extraFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <input className={inputClass} value={field} onChange={(e) => { const updated = [...extraFields]; updated[index] = e.target.value; setExtraFields(updated); }} />
                        <button onClick={() => setExtraFields(extraFields.filter((_, i) => i !== index))} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveCategory} disabled={loading} className="w-full py-4 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-black uppercase rounded-2xl shadow-xl transition-all">
                  {loading ? "Processing..." : editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryClient;