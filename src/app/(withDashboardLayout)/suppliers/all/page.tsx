"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Truck, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Building2, User, Edit3, Eye, X } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { getAllSuppliersAction, deleteSupplierAction, updateSupplierAction } from "@/services/supplierActions";
import { motion, AnimatePresence } from "framer-motion";

const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-8 py-5 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-32 mb-2" /><div className="h-3 bg-gray-50 rounded w-24" /></td>
        <td className="px-8 py-5 border-b border-gray-50"><div className="h-4 bg-gray-50 rounded w-40" /></td>
        <td className="px-8 py-5 text-right border-b border-gray-50"><div className="h-9 w-24 bg-gray-50 rounded-xl ml-auto" /></td>
      </tr>
    ))}
  </>
);

const AllSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 7;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setInitialLoading(true);
    const res = await getAllSuppliersAction(searchQuery, currentPage, itemsPerPage);
    if (res.success) {
      setSuppliers(res.data);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalItems || 0);
    }
    setInitialLoading(false);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchSuppliers(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchSuppliers]);

  const handleAction = (supplier: any, mode: "view" | "edit") => {
    setSelectedSupplier({ ...supplier });
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    const res = await updateSupplierAction(selectedSupplier._id, selectedSupplier);
    setUpdateLoading(false);
    if (res.success) {
      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
      setIsModalOpen(false);
      fetchSuppliers();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This supplier will be permanently removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f9db3d",
      confirmButtonText: "Yes, delete",
      customClass: { confirmButton: "swal-confirm-black-text" }
    });
    if (result.isConfirmed) {
      const res = await deleteSupplierAction(id);
      if (res.success) {
        fetchSuppliers();
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
      }
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all font-bold";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6 pb-10">
      {/* Header - Design Kept Same */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Truck size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Suppliers List</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage your product vendors</p>
          </div>
        </div>
        <Link href="/suppliers/create" className="px-6 py-3 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-extrabold rounded-2xl shadow-sm transition-all flex items-center gap-2 text-xs uppercase">
          <Plus size={18} /> Add New Supplier
        </Link>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name, company or phone..." className={`${inputClass} pl-11 h-full`} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="bg-black rounded-2xl p-4 flex items-center justify-between text-white border border-gray-800">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total</span>
            <span className="text-2xl font-black text-[#f9db3d]">{totalItems}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Information</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialLoading ? <TableSkeleton /> : suppliers.length > 0 ? (
                suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#f9db3d] group-hover:text-black transition-colors"><User size={14} /></div>
                        <div>
                          <span className="font-bold text-gray-800 text-sm">{s.name}</span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mt-0.5"><Building2 size={10} /> {s.companyName || "No Company"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"><Phone size={12} /> {s.phone}</a>
                        {s.email && <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium"><Mail size={12} /> {s.email}</div>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(s, "view")} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={16}/></button>
                        <button onClick={() => handleAction(s, "edit")} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(s._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-8 py-32 text-center text-[11px] font-black uppercase opacity-20 tracking-widest">No Suppliers Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 mt-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing {suppliers.length} of {totalItems} Suppliers</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20 hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm disabled:opacity-20 hover:bg-gray-50"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-gray-300 hover:text-black"><X size={28}/></button>
              
              <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                {modalMode === "edit" ? <Edit3 className="text-amber-500" /> : <Eye className="text-blue-500" />}
                {modalMode === "edit" ? "Edit Supplier" : "Supplier Details"}
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input disabled={modalMode === "view"} className={inputClass} value={selectedSupplier?.name} onChange={e => setSelectedSupplier({...selectedSupplier, name: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input disabled={modalMode === "view"} className={inputClass} value={selectedSupplier?.companyName} onChange={e => setSelectedSupplier({...selectedSupplier, companyName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input disabled={modalMode === "view"} className={inputClass} value={selectedSupplier?.phone} onChange={e => setSelectedSupplier({...selectedSupplier, phone: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input disabled={modalMode === "view"} className={inputClass} value={selectedSupplier?.email} onChange={e => setSelectedSupplier({...selectedSupplier, email: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input disabled={modalMode === "view"} className={inputClass} value={selectedSupplier?.address} onChange={e => setSelectedSupplier({...selectedSupplier, address: e.target.value})} />
                </div>

                {modalMode === "edit" && (
                  <button onClick={handleUpdate} disabled={updateLoading} className="w-full py-4 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-black uppercase rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                    {updateLoading ? "Updating..." : "Save Changes"}
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

export default AllSuppliers;