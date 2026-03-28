"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, LayoutGrid, X, Package, Settings2, Barcode, Shield, ArrowRight, Tag } from "lucide-react";
import Swal from "sweetalert2";
import { getAllCategoriesAction } from "@/services/categoryActions";
import { getBrandsByCategoryAction } from "@/services/brandActions"; // ব্র্যান্ড অ্যাকশনটি ইমপোর্ট করুন
import { motion, AnimatePresence } from "framer-motion";
import { createProductAction, deleteProductAction, getAllProductsAction } from "@/services/productActions";

const ProductClient = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]); // ফিল্টার করা ব্র্যান্ডের জন্য স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Form States
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", universalCode: "", buyingPrice: "", sellingPrice: "", 
    stock: "", brand: "Generic", warranty: 0
  });
  const [dynamicAttributes, setDynamicAttributes] = useState<any>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const swalConfig: any = {
    confirmButtonColor: "#f9db3d",
    customClass: { title: "swal-title-black", htmlContainer: "swal-text-black", confirmButton: "swal-confirm-black-text" }
  };

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    const [pRes, cRes] = await Promise.all([
      getAllProductsAction(searchQuery, catFilter, currentPage),
      getAllCategoriesAction("", 1, 100)
    ]);
    if (pRes.success) {
      setProducts(pRes.data);
      setTotalPages(pRes.totalPages);
    }
    if (cRes.success) setCategories(cRes.data);
    setInitialLoading(false);
  }, [searchQuery, catFilter, currentPage]);

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [fetchData]);

  // ম্যাজিক ফাংশন: ক্যাটাগরি চেঞ্জ হলে ব্র্যান্ড লোড হবে
  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const cat = categories.find(c => c._id === catId);
    setSelectedCategory(cat);
    setDynamicAttributes({}); 
    setFormData({ ...formData, brand: "Generic" }); // ক্যাটাগরি বদলালে ব্র্যান্ড রিসেট

    if (catId) {
      const res = await getBrandsByCategoryAction(catId);
      if (res.success) {
        setFilteredBrands(res.data);
      }
    } else {
      setFilteredBrands([]);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.universalCode || !selectedCategory) {
       return Swal.fire({...swalConfig, icon: "error", title: "Missing Data", text: "Name, Code and Category are required!"});
    }

    setLoading(true);
    const res = await createProductAction({
      ...formData,
      category: selectedCategory._id,
      attributes: dynamicAttributes
    });
    setLoading(false);

    if (res.success) {
      Swal.fire({...swalConfig, icon: "success", title: res.message});
      closeModal();
      fetchData();
    } else {
      Swal.fire({...swalConfig, icon: "error", title: "Error", text: res.message});
    }
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      ...swalConfig,
      title: "Delete Product?",
      text: `Are you sure you want to remove ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteProductAction(id);
        fetchData();
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", universalCode: "", buyingPrice: "", sellingPrice: "", stock: "", brand: "Generic", warranty: 0 });
    setSelectedCategory(null);
    setFilteredBrands([]);
    setDynamicAttributes({});
    document.body.style.overflow = "unset";
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all shadow-sm disabled:opacity-50";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Package size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Stock Management</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory & Pricing Control</p>
          </div>
        </div>
        <button onClick={() => { setIsModalOpen(true); document.body.style.overflow="hidden"; }} className="px-5 py-2.5 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-bold rounded-xl shadow-sm flex items-center gap-2 text-sm transition-all"><Plus size={18} /> Add Product</button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name or code..." className={`${inputClass} pl-11 h-full font-medium`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className={inputClass} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="bg-black rounded-2xl p-4 flex items-center justify-between text-white border border-gray-800 shadow-md">
            <span className="text-[10px] font-black uppercase opacity-60">Products</span>
            <span className="text-2xl font-black text-[#f9db3d]">{products.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing & Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialLoading ? (
                 <tr><td colSpan={4} className="p-20 text-center text-gray-300 font-black uppercase tracking-widest animate-pulse">Loading Inventory...</td></tr>
              ) : products.length > 0 ? products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-gray-800 text-sm block uppercase tracking-tight">{p.name}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Barcode size={12} className="text-gray-400" />
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{p.universalCode}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-gray-200">{p.category?.name}</span>
                    <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> {p.brand}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-6">
                      <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Sell Price</p><p className="font-black text-gray-900 text-sm tracking-tight">৳{p.sellingPrice}</p></div>
                      <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Stock</p><p className={`font-black text-sm ${p.stock < 5 ? "text-red-500" : "text-green-600"}`}>{p.stock} Units</p></div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => handleDelete(p._id, p.name)} className="p-2.5 bg-gray-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><Trash2 size={16}/></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-24 text-center text-gray-200 font-black uppercase tracking-[0.3em]">Stock Empty</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white w-full max-w-3xl rounded-[40px] p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={closeModal} className="absolute right-8 top-8 text-gray-300 hover:text-black transition-colors"><X size={28}/></button>
              
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-8 flex items-center gap-3"><Barcode className="text-amber-500" size={28}/> Add Product</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Title *</label>
                  <input className={inputClass} placeholder="Full product name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className={labelClass}>Universal Code / SKU *</label>
                  <input className={inputClass} placeholder="Scan or type barcode" value={formData.universalCode} onChange={e => setFormData({...formData, universalCode: e.target.value})} />
                </div>
                
                <div>
                  <label className={labelClass}>Select Category *</label>
                  <select className={inputClass} onChange={handleCategoryChange} value={selectedCategory?._id || ""}>
                    <option value="">Choose Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                   <label className={labelClass}>Select Brand</label>
                   <select 
                     className={inputClass} 
                     value={formData.brand} 
                     onChange={e => setFormData({...formData, brand: e.target.value})}
                     disabled={!selectedCategory}
                   >
                     <option value="Generic">Generic / No Brand</option>
                     {filteredBrands.map(b => (
                       <option key={b._id} value={b.name}>{b.name}</option>
                     ))}
                   </select>
                   {!selectedCategory && <p className="text-[9px] text-amber-500 mt-1 font-bold italic uppercase tracking-tighter">* Select category first to see brands</p>}
                </div>
                
                <div>
                  <label className={labelClass}>Warranty (Months)</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                    <input type="number" className={`${inputClass} pl-10`} value={formData.warranty} onChange={e => setFormData({...formData, warranty: parseInt(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                   <div><label className={labelClass}>Buying Price</label><input type="number" className={inputClass} value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} /></div>
                   <div><label className={labelClass}>Selling Price</label><input type="number" className={inputClass} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} /></div>
                   <div><label className={labelClass}>New Stock</label><input type="number" className={`${inputClass} border-green-100`} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="+ Qty" /></div>
                </div>
              </div>

              {/* Attributes based on selected Category */}
              {selectedCategory?.extraFields?.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Settings2 size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Category Specifications</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCategory.extraFields.map((field: string) => (
                      <div key={field}>
                        <label className={labelClass}>{field}</label>
                        <input className={inputClass} placeholder={`Value for ${field}`} onChange={e => setDynamicAttributes({...dynamicAttributes, [field]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSaveProduct} disabled={loading} className="w-full mt-10 py-4 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-black uppercase rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                {loading ? "Processing..." : <>Update Inventory <ArrowRight size={18} /></>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductClient;