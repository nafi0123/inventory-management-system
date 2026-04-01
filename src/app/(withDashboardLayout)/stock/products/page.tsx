"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Trash2, Package, Search, Eye, Edit3, LayoutGrid, ArrowRight, Filter, ChevronLeft, ChevronRight, BellRing, User, ShieldCheck, Tag, Cpu, Smartphone, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCategoriesAction } from "@/services/categoryActions";
import { getBrandsByCategoryAction } from "@/services/brandActions";
import { getAllSuppliersAction } from "@/services/supplierActions";
import { createProductAction, deleteProductAction, getAllProductsAction, getProductByCodeAction, updateProductAction } from "@/services/productActions";

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-8 py-5 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-32 mb-2" /><div className="h-3 bg-gray-50 rounded w-20" /></td>
        <td className="px-8 py-5 border-b border-gray-50"><div className="h-4 bg-gray-50 rounded w-24" /></td>
        <td className="px-8 py-5 border-b border-gray-50"><div className="h-6 bg-gray-50 rounded-full w-20" /></td>
        <td className="px-8 py-5 text-right border-b border-gray-50"><div className="flex justify-end gap-2"><div className="h-9 w-9 bg-gray-50 rounded-xl" /></div></td>
      </tr>
    ))}
  </>
);

const ProductClient = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [conditionFilter, setConditionFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Server-side Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [imeiNumbers, setImeiNumbers] = useState<string[]>([]);
  const [currentImei, setCurrentImei] = useState("");
  const [dynamicAttributes, setDynamicAttributes] = useState<any>({});
  const [mobileType, setMobileType] = useState("official");

// ১. formData তে condition যোগ করা হয়েছে
  const [formData, setFormData] = useState({
    name: "", 
    originalBarcode: "", 
    supplier: "", 
    buyingPrice: "", 
    sellingPrice: "", 
    stock: "", 
    brand: "", 
    condition: "New", // Default value
    warranty: 0, 
    lowStockAlert: 5
  });

  // ২. fetchData তে filters পাঠানো হচ্ছে (সার্ভার সাইড ফিল্টারিং এর জন্য)
  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    const [pRes, cRes, sRes] = await Promise.all([
      // getAllProductsAction এ filters অবজেক্ট পাঠানো হয়েছে
      getAllProductsAction(currentPage, itemsPerPage, {
        category: categoryFilter,
        condition: conditionFilter,
        type: typeFilter
      }), 
      getAllCategoriesAction("", 1, 100), 
      getAllSuppliersAction()
    ]);

    if (pRes.success) {
      setProducts(pRes.data);
      if (pRes.meta) {
        setTotalPages(pRes.meta.totalPages);
      }
    }
    if (cRes.success) setCategories(cRes.data);
    if (sRes.success) setSuppliers(sRes.data);
    setInitialLoading(false);
  }, [currentPage, categoryFilter, conditionFilter, typeFilter]); // Dependency list updated

  useEffect(() => { fetchData(); }, [fetchData]);

  // ৩. filteredProducts লজিক (Client-side useMemo)
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.barcodeId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || (p.category?._id || p.category) === categoryFilter;
      
      // Condition Filter check
      const matchesCondition = conditionFilter === "all" || p.condition === conditionFilter;

      const pAttrs = p.attributes instanceof Map ? Object.fromEntries(p.attributes) : (p.attributes || {});
      const matchesType = typeFilter === "all" || pAttrs?.mobileType === typeFilter;

      return matchesSearch && matchesCategory && matchesCondition && matchesType;
    });
  }, [products, searchTerm, categoryFilter, typeFilter, conditionFilter]);

  // ৪. runLocalScan (Autofill logic update)
  const runLocalScan = async () => {
    const code = formData.originalBarcode?.trim();
    if (!code) return;

    setLoading(true);
    const res = await getProductByCodeAction(code);
    setLoading(false);

    if (res.success && res.data) {
      const p = res.data;
      
      setFormData({
        name: p.name || "",
        originalBarcode: p.originalBarcode || code,
        supplier: p.supplier?._id || p.supplier || "",
        buyingPrice: p.buyingPrice || "",
        sellingPrice: p.sellingPrice || "",
        stock: "0", 
        brand: p.brand?._id || p.brand || "", 
        condition: p.condition || "New", // Database theke condition anbe
        warranty: p.warranty || 0,
        lowStockAlert: p.lowStockAlert || 5
      });

      const foundCategory = categories.find(c => c._id === (p.category?._id || p.category));
      if (foundCategory) {
        setSelectedCategory(foundCategory);
        getBrandsByCategoryAction(foundCategory._id).then(r => r.success && setFilteredBrands(r.data));
      }

      setImeiNumbers([]); 
      const pAttrs = p.attributes instanceof Map ? Object.fromEntries(p.attributes) : (p.attributes || {});
      setDynamicAttributes(pAttrs);
      if(pAttrs?.mobileType) setMobileType(pAttrs.mobileType);
    }
  };

  // ৫. handleDelete
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ 
      title: "Delete Lot?", 
      text: "Are you sure?", 
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete" 
    });

    if (result.isConfirmed) {
      const res = await deleteProductAction(id);
      if (res.success) {
        if (filteredProducts.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchData(); 
        }
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1000, showConfirmButton: false });
      }
    }
  };

  const handleCategoryChange = async (catId: string) => {
    const cat = categories.find(c => c._id === catId);
    setSelectedCategory(cat);
    if (cat && cat.extraFields) {
      const initialAttrs: any = {};
      cat.extraFields.forEach((field: string) => { initialAttrs[field] = ""; });
      setDynamicAttributes(initialAttrs);
      const r = await getBrandsByCategoryAction(cat._id);
      setFilteredBrands(r.data || []);
    } else {
      setDynamicAttributes({});
    }
  };

  // ৬. openEdit (Condition load logic)
  const openEdit = (p: any) => {
    setSelectedProduct(p);
    setEditMode(true);
    setFormData({ 
      name: p.name, 
      originalBarcode: p.originalBarcode, 
      supplier: p.supplier?._id || p.supplier, 
      buyingPrice: p.buyingPrice, 
      sellingPrice: p.sellingPrice, 
      stock: p.stock, 
      brand: p.brand?._id || p.brand || "", 
      condition: p.condition || "New", // Set condition in edit
      warranty: p.warranty || 0, 
      lowStockAlert: p.lowStockAlert || 5 
    });
    setImeiNumbers(p.imeiNumbers || []);
    setDynamicAttributes(p.attributes instanceof Map ? Object.fromEntries(p.attributes) : (p.attributes || {}));
    const cat = categories.find(c => c._id === (p.category?._id || p.category));
    setSelectedCategory(cat);
    if(cat) getBrandsByCategoryAction(cat._id).then(r => setFilteredBrands(r.data || []));
    
    const pAttrs = p.attributes instanceof Map ? Object.fromEntries(p.attributes) : (p.attributes || {});
    if(pAttrs?.mobileType) setMobileType(pAttrs.mobileType);
    setIsModalOpen(true);
  };

  // ৭. closeModal (Reset logic update)
  const closeModal = () => {
    setIsModalOpen(false); 
    setEditMode(false); 
    setSelectedProduct(null); 
    setSelectedCategory(null);
    setImeiNumbers([]); 
    setDynamicAttributes({}); 
    setMobileType("official"); 
    setFilteredBrands([]);
    setFormData({ 
      name: "", 
      originalBarcode: "", 
      supplier: "", 
      buyingPrice: "", 
      sellingPrice: "", 
      stock: "", 
      brand: "", 
      condition: "New", // Reset to default
      warranty: 0, 
      lowStockAlert: 5 
    });
    setCurrentImei("");
  };

  // ৮. handleSave (Payload structure update)
  const handleSave = async () => {
    if (!formData.name || !formData.originalBarcode || !formData.supplier || !selectedCategory) {
        return Swal.fire("Error", "Required fields missing!", "error");
    }
    setLoading(true);
    const catName = selectedCategory.name.toUpperCase();
    const isMobile = catName.includes("MOBILE");
    const isLaptop = catName.includes("LAPTOP");
    const finalAttributes = { ...dynamicAttributes };
    
    if(isMobile) {
        finalAttributes.mobileType = mobileType;
        if(mobileType === "official") { delete finalAttributes.replacement; delete finalAttributes.service; }
    }

    const payload = { 
        ...formData, 
        category: selectedCategory._id, 
        attributes: finalAttributes, 
        condition: formData.condition || "New", // Final database save
        hasIMEI: isMobile || isLaptop, 
        imeiNumbers: (isMobile || isLaptop) ? imeiNumbers : [], 
        stock: (isMobile || isLaptop) ? imeiNumbers.length : Number(formData.stock),
    };
    
    const res = editMode ? await updateProductAction(selectedProduct._id, payload) : await createProductAction(payload);
    setLoading(false);
    if (res.success) { 
      closeModal(); 
      fetchData(); 
      Swal.fire({ title: "Success", icon: "success", timer: 1500, showConfirmButton: false }); 
    } else { 
      Swal.fire("Failed", res.message, "error"); 
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all font-bold uppercase";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><LayoutGrid size={24} /></div>
          <div><h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Stock Inventory</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage your products & lots</p></div>
        </div>
        <div className="flex gap-2">
            <Link href="/stock/categories" className="px-5 py-2.5 bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2">Setup Categories <ArrowRight size={14} /></Link>
            <button onClick={() => { setIsModalOpen(true); setEditMode(false); }} className="px-5 py-2.5 bg-[#f9db3d] hover:bg-[#e6c930]  text-black font-bold rounded-xl shadow-sm flex items-center gap-2 text-sm uppercase"><Plus size={18} /> New Lot Entry</button>
        </div>
      </div>

    {/* Filter Bar */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
    {/* Search */}
    <div className="lg:col-span-3 relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input type="text" placeholder="Search..." className={`${inputClass} pl-11 h-full normal-case font-medium`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    </div>

    {/* Category Filter */}
    <div className="lg:col-span-2 relative flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
      <Filter size={16} className="text-gray-400 mr-2" />
      <select className="w-full bg-transparent py-2.5 text-[10px] font-bold uppercase outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
    </div>

    {/* Condition Filter (NEW) */}
    <div className="lg:col-span-2 relative flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
      <Sparkles size={16} className="text-amber-500 mr-2" />
      <select 
        className="w-full bg-transparent py-2.5 text-[10px] font-bold uppercase outline-none" 
        value={conditionFilter} // conditionFilter স্টেট ব্যবহার করুন
        onChange={(e) => setConditionFilter(e.target.value)}
      >
          <option value="all">All Condition</option>
          <option value="New">New Only</option>
          <option value="Used">Used Only</option>
      </select>
    </div>

    {/* Type Filter */}
    <div className="lg:col-span-3 relative flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
      <Package size={16} className="text-gray-400 mr-2" />
      <select className="w-full bg-transparent py-2.5 text-[10px] font-bold uppercase outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="official">Official Only</option>
          <option value="unofficial">Unofficial Only</option>
      </select>
    </div>

    {/* Count Display */}
    <div className="lg:col-span-2 bg-black rounded-xl p-3 text-white flex flex-col justify-center text-center">
        <span className="text-[8px] font-black uppercase opacity-60">Loaded</span>
        <span className="text-xl font-black text-[#f9db3d] leading-none">{filteredProducts.length}</span>
    </div>
</div>





      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lot ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {initialLoading ? <TableSkeleton /> : filteredProducts.length > 0 ? filteredProducts.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-8 py-5">
                    <span className="font-bold text-gray-800 text-sm uppercase">{p.name}</span>
                    <div className="flex gap-2 mt-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{p.brand} • {p.category?.name}</span>
                        {(p.attributes instanceof Map ? p.attributes.get('mobileType') : p.attributes?.mobileType) && (
                          <span className={`text-[8px] font-black uppercase px-1.5 rounded ${(p.attributes instanceof Map ? p.attributes.get('mobileType') : p.attributes.mobileType) === 'official' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {p.attributes instanceof Map ? p.attributes.get('mobileType') : p.attributes.mobileType}
                          </span>
                        )}
                    </div>
                </td>
                <td className="px-8 py-5 font-mono text-xs text-gray-400 uppercase">{p.barcodeId}</td>
                <td className="px-8 py-5"><span className={`${p.stock <= (p.lowStockAlert || 5) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'} px-3 py-1 rounded-lg text-[10px] font-black uppercase border`}>{p.stock} Units</span></td>
                <td className="px-8 py-5 text-right space-x-2">
                  <button onClick={() => { setSelectedProduct(p); setIsViewModalOpen(true); }} className="p-2 bg-gray-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Eye size={16}/></button>
                  <button onClick={() => openEdit(p)} className="p-2 bg-gray-50 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 bg-gray-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </td>
              </tr>
            )) : (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><p className="text-gray-400 font-bold uppercase text-xs">No products found</p></td></tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS - FIXED: Filtered products logic checked */}
        {!initialLoading && filteredProducts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-[#f9db3d] hover:text-black hover:border-[#f9db3d] transition-all shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-[#f9db3d] hover:text-black hover:border-[#f9db3d] transition-all shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>

{/* Entry/Edit Modal */}
      <AnimatePresence>
  {isModalOpen && (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        <button onClick={closeModal} className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
        <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Package className="text-amber-500" /> {editMode ? "Update Lot" : "New Lot Entry"}</h3>
        
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* BARCODE INPUT - Auto-Save bondho kora hoyeche */}
            <div>
              <label className={labelClass}>Barcode Scan *</label>
              <input 
                className={`${inputClass} border-amber-200 focus:ring-amber-400`} 
                value={formData.originalBarcode} 
                onChange={e => setFormData({...formData, originalBarcode: e.target.value})} 
                onBlur={runLocalScan}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Form save hoba bondho korbe
                    runLocalScan();     // Shudhu autofill trigger korbe
                  }
                }}
                placeholder="Scan Code & Press Enter" 
              />
            </div>
            <div><label className={labelClass}>Product Name *</label><input className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} /></div>
          </div>
{/* SECOND GRID: Category & Brand Selection */}
<div className="grid grid-cols-2 gap-4">
  {/* Category Field */}
  <div>
    <label className={labelClass}>Category *</label>
    <select 
      className={inputClass} 
      value={selectedCategory?._id || ""} 
      onChange={async (e) => {
        const cat = categories.find(c => c._id === e.target.value);
        setSelectedCategory(cat); 
        setDynamicAttributes({}); 
        setImeiNumbers([]);
        // ক্যাটাগরি চেঞ্জ হলে ব্র্যান্ড ফিল্ড রিসেট হবে
        setFormData({ ...formData, category: e.target.value, brand: "" });
        
        if(cat) { 
          // এই ফাংশনটি আপনার সিলেক্ট করা ক্যাটাগরির ব্র্যান্ডগুলো নিয়ে আসবে
          const r = await getBrandsByCategoryAction(cat._id); 
          setFilteredBrands(r.data || []); 
        } else {
          setFilteredBrands([]);
        }
      }}
    >
      <option value="">Select Category</option>
      {categories.map(c => (
        <option key={c._id} value={c._id}>{c.name}</option>
      ))}
    </select>
  </div>

  {/* Brand Field (Dropdown Only) */}
  <div>
    <label className={labelClass}>Brand *</label>
    <select 
      className={inputClass} 
      value={formData.brand || ""} 
      onChange={e => setFormData({...formData, brand: e.target.value})}
      disabled={!selectedCategory} // ক্যাটাগরি সিলেক্ট না করলে এটি বন্ধ থাকবে
    >
      <option value="">{selectedCategory ? "Select Brand" : "Choose Category First"}</option>
      {filteredBrands.map(b => (
        <option key={b._id} value={b._id}>{b.name}</option>
      ))}
    </select>
  </div>
</div>




{/* THIRD GRID: Supplier Selection */}
<div className="grid grid-cols-1 gap-4 mt-4">
  <div>
    <label className={labelClass}>Product Condition *</label>
    <select 
      className={`${inputClass} border-blue-200 focus:ring-blue-400 bg-blue-50/30`} 
      value={formData.condition || "New"} 
      onChange={e => setFormData({...formData, condition: e.target.value})}
    >
      <option value="New">Brand New</option>
      <option value="Used"> Used / Second Hand</option>
    </select>
  </div>
  <div>
    <label className={labelClass}>Supplier *</label>
    <select 
      className={inputClass} 
      value={formData.supplier} 
      onChange={e => setFormData({...formData, supplier: e.target.value})}
    >
      <option value="">Select Supplier</option>
      {suppliers.map(s => (
        <option key={s._id} value={s._id}>{s.name}</option>
      ))}
    </select>
  </div>
</div>
          {/* DYNAMIC EXTRA FIELDS */}
          {selectedCategory && selectedCategory.extraFields?.length > 0 && (
            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 grid grid-cols-2 gap-4">
              {selectedCategory.extraFields.map((field: string) => (
                <div key={field}>
                  <label className={labelClass}>{field}</label>
                  <input 
                    className={inputClass + " border-amber-200"} 
                    placeholder={`Enter ${field}`}
                    value={dynamicAttributes[field] || ""}
                    onChange={(e) => setDynamicAttributes({...dynamicAttributes, [field]: e.target.value.toUpperCase()})}
                  />
                </div>
              ))}
            </div>
          )}

{/* IMEI Entry Section with Database Global Check */}
{/* 1. Mobile Type & Warranty Section */}

{selectedCategory?.name.toUpperCase().includes("MOBILE") && (
  <div className="p-5 bg-gray-50/80 rounded-[24px] border border-gray-200 space-y-4">
    <div className="flex items-center justify-between">
      <label className={labelClass}>Product Type & Warranty</label>
      <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileType("official")}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
            mobileType === "official" ? "bg-black text-[#f9db3d]" : "text-gray-400 hover:text-black"
          }`}
        >
          Official
        </button>
        <button
          type="button"
          onClick={() => setMobileType("unofficial")}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
            mobileType === "unofficial" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-black"
          }`}
        >
          Unofficial
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {mobileType === "official" ? (
        <div className="col-span-2">
          <label className={labelClass}>Brand Warranty (Months)</label>
          <div className="relative">
            {/* ShieldCheck Icon Remove kora hoyeche padding soho */}
            <input 
              type="number" 
              className={inputClass} 
              placeholder="Enter Months (e.g. 12)"
              value={formData.warranty || ""} 
              onChange={e => setFormData({...formData, warranty: e.target.value})}
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className={labelClass}>Replacement (Days)</label>
            <input 
              type="number" 
              className={inputClass} 
              placeholder="e.g. 7"
              value={dynamicAttributes.replacement || ""} 
              onChange={e => setDynamicAttributes({...dynamicAttributes, replacement: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}>Service Warranty (Years)</label>
            <input 
              type="number" 
              className={inputClass} 
              placeholder="e.g. 1"
              value={dynamicAttributes.service || ""} 
              onChange={e => setDynamicAttributes({...dynamicAttributes, service: e.target.value})}
            />
          </div>
        </>
      )}
    </div>
  </div>
)}



{/* 2. IMEI Entry Section (Category-r upor base kore show korbe) */}
{(selectedCategory?.name.toUpperCase().includes("MOBILE") || selectedCategory?.name.toUpperCase().includes("LAPTOP")) && (
  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
    <label className={labelClass + " text-blue-600"}>IMEI / Serial Numbers</label>
    <input 
      className={inputClass} 
      placeholder="Scan & Press Enter" 
      value={currentImei} 
      onChange={e => setCurrentImei(e.target.value)} 
      onKeyDown={async (e) => { 
        if(e.key === 'Enter') { 
          e.preventDefault(); 
          const val = currentImei.trim().toUpperCase(); 
          
          if(val) {
            // Local check (Current List)
            if(imeiNumbers.includes(val)) {
              Swal.fire({ title: "Local Duplicate!", text: `Already in this list.`, icon: "warning", timer: 1500 });
              setCurrentImei("");
              return;
            }

            // Global DB check (Pura database check)
            const dbCheck = await getProductByCodeAction(val); 
            
            // Database e data thaka mane holo eita duplicate
            if(dbCheck.success && dbCheck.data) {
              Swal.fire({
                title: "Already in Stock!",
                text: `IMEI ${val} exists for: ${dbCheck.data.name}`,
                icon: "error",
                confirmButtonColor: "#ef4444",
              });
              setCurrentImei("");
            } else {
              // No duplicate found in DB or Local
              setImeiNumbers([...imeiNumbers, val]); 
              setCurrentImei(""); 
            }
          }
        } 
      }} 
    />
<div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">

      {imeiNumbers.map(i => (

        <span key={i} className="bg-black text-[#f9db3d] text-[9px] font-black px-2 py-1 rounded flex items-center gap-1 shadow-sm">

          {i} 

          <X size={10} className="cursor-pointer hover:text-white" onClick={() => setImeiNumbers(imeiNumbers.filter(n => n !== i))} />

        </span>

      ))}

    </div>  </div>
)}

          <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl">
             <div><label className={labelClass}>Buy</label><input type="number" className={inputClass} value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})}/></div>
             <div><label className={labelClass}>Sell</label><input type="number" className={inputClass} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})}/></div>
             <div><label className={labelClass}>Stock</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={(selectedCategory?.name.toUpperCase().includes("MOBILE") || selectedCategory?.name.toUpperCase().includes("LAPTOP")) ? imeiNumbers.length : formData.stock} 
                  disabled={(selectedCategory?.name.toUpperCase().includes("MOBILE") || selectedCategory?.name.toUpperCase().includes("LAPTOP"))} 
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
             </div>
             <div><label className={labelClass}>Alert</label><input type="number" className={inputClass} value={formData.lowStockAlert} onChange={e => setFormData({...formData, lowStockAlert: e.target.value})}/></div>
          </div>

          {/* MAIN SAVE BUTTON - Shudhu eitai save trigger korbe */}
          <button 
            type="button" // Type button deya safe, jate Enter chaple form submit na hoy
            onClick={handleSave} 
            disabled={loading} 
            className="w-full py-4 bg-[#f9db3d] hover:bg-[#e6c930]  font-black uppercase rounded-2xl shadow-lg  transition-all active:scale-95"
          >
            {loading ? "Saving..." : "Save Product Lot"}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* Product View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[40px] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={() => setIsViewModalOpen(false)} className="absolute right-8 top-8 text-gray-400 hover:text-black transition-all bg-gray-50 p-2 rounded-full"><X size={20}/></button>
                
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 shrink-0 border-4 border-white shadow-sm">
                        {selectedProduct.category?.name?.toUpperCase().includes("MOBILE") ? <Smartphone size={40} /> : <Package size={40} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase text-gray-900 leading-none">{selectedProduct.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest">{selectedProduct.brand || "GENERIC"}</span>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">• {selectedProduct.category?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-black p-5 rounded-[30px] text-center shadow-lg">
                        <span className="block text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest">Current Stock</span>
                        <span className="text-xl font-black text-[#f9db3d] leading-none">{selectedProduct.stock}</span>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-[30px] text-center border border-gray-100">
                        <span className="block text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest">Selling Price</span>
                        <span className="text-xl font-black text-green-600 leading-none">৳{selectedProduct.sellingPrice}</span>
                    </div>
                    <div className={`p-5 rounded-[30px] text-center border flex flex-col items-center justify-center ${selectedProduct.stock <= selectedProduct.lowStockAlert ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <BellRing size={14} className={selectedProduct.stock <= selectedProduct.lowStockAlert ? 'text-red-500 mb-1' : 'text-green-500 mb-1'} />
                        <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Alert Limit</span>
                        <span className="text-lg font-black text-gray-900 mt-1">{selectedProduct.lowStockAlert || 5}</span>
                    </div>
                </div>

                <div className="space-y-4 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2 text-gray-400"><User size={14}/><span className="text-[10px] font-black uppercase">Supplier</span></div>
                        <span className="text-[11px] font-bold text-gray-800 uppercase">{selectedProduct.supplier?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2 text-gray-400"><Tag size={14}/><span className="text-[10px] font-black uppercase">Lot ID</span></div>
                        <span className="text-[11px] font-mono font-bold text-gray-800 uppercase">{selectedProduct.barcodeId}</span>
                    </div>
                    
                    {selectedProduct.attributes && (selectedProduct.attributes instanceof Map ? Array.from(selectedProduct.attributes.entries()) : Object.entries(selectedProduct.attributes)).map(([key, value]: any) => {
                        if (!value) return null;
                        return (
                            <div key={key} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <ShieldCheck size={14}/>
                                    <span className="text-[10px] font-black uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                                <span className="text-[11px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                                    {String(value)} {key.includes('replacement') ? 'Days' : key.includes('service') ? 'Years' : ''}
                                </span>
                            </div>
                        );
                    })}

                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400"><Tag size={14}/><span className="text-[10px] font-black uppercase">Unit Cost</span></div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase">৳{selectedProduct.buyingPrice}</span>
                    </div>
                </div>

                {selectedProduct.imeiNumbers?.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {selectedProduct.category?.name?.toUpperCase().includes("LAPTOP") ? "SERIAL NUMBERS" : "IMEI NUMBERS"} ({selectedProduct.imeiNumbers.length})
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-inner">
                            {selectedProduct.imeiNumbers.map((im: string) => (
                                <span key={im} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-all cursor-default">
                                    {im}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductClient;