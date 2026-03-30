"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Sparkles, Loader2, Trash2, Package, Truck } from "lucide-react";
import Swal from "sweetalert2";
import { getAllCategoriesAction } from "@/services/categoryActions";
import { getBrandsByCategoryAction } from "@/services/brandActions";
import { getAllSuppliersAction } from "@/services/supplierActions";
import { motion, AnimatePresence } from "framer-motion";
import { 
  createProductAction, deleteProductAction, getAllProductsAction, 
  getProductByCodeAction, getProductInfoFromAIAction 
} from "@/services/productActions";

const ProductClient = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "", 
    originalBarcode: "", 
    supplier: "", 
    buyingPrice: "", 
    sellingPrice: "", 
    stock: "", 
    brand: "Generic", 
    warranty: 0
  });

  const [dynamicAttributes, setDynamicAttributes] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");

  // ১. সব ডাটা ফেচ করা
  const fetchData = useCallback(async () => {
    const [pRes, cRes, sRes] = await Promise.all([
      getAllProductsAction(searchQuery, catFilter, 1, 50),
      getAllCategoriesAction("", 1, 100),
      getAllSuppliersAction()
    ]);
    if (pRes.success) setProducts(pRes.data);
    if (cRes.success) setCategories(cRes.data);
    if (sRes.success) setSuppliers(sRes.data);
  }, [searchQuery, catFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ২. AI এবং DB স্ক্যান লজিক (যেখানে ডাইনামিক ফিল্ড ফিক্স করা হয়েছে)
  const runAIScan = async () => {
    if (!formData.originalBarcode) return;
    setIsIdentifying(true);
    
    try {
      const local = await getProductByCodeAction(formData.originalBarcode);
      
      if (local.success && local.data) {
        const p = local.data;
        
        // ক্যাটাগরি অবজেক্ট খুঁজে বের করা (যাতে ডাইনামিক ফিল্ড রেন্ডার হয়)
        const catId = p.category?._id || p.category;
        const foundCategory = categories.find(c => c._id === catId);
        
        if (foundCategory) {
          setSelectedCategory(foundCategory);
          const brandRes = await getBrandsByCategoryAction(foundCategory._id);
          if (brandRes.success) setFilteredBrands(brandRes.data);
        }

        setFormData(prev => ({ 
          ...prev, 
          name: p.name, 
          brand: p.brand || "Generic",
          supplier: p.supplier?._id || p.supplier || "" 
        }));
        
        setDynamicAttributes(p.attributes || {});
        Swal.fire({ title: "Found in Inventory", icon: "success", timer: 1000, showConfirmButton: false });
      } else {
        const ai = await getProductInfoFromAIAction(formData.originalBarcode);
        if (ai.success && ai.data) {
          setFormData(prev => ({ ...prev, name: ai.data.name || "", brand: ai.data.brand || "Generic" }));
          if (ai.data.specs) setDynamicAttributes(ai.data.specs);
          Swal.fire({ title: "AI Autofilled!", icon: "success", timer: 1000, showConfirmButton: false });
        }
      }
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.originalBarcode || !formData.supplier || !formData.buyingPrice || !selectedCategory) {
      return Swal.fire("Error", "Required fields are missing!", "error");
    }
    setLoading(true);
    const res = await createProductAction({ 
      ...formData, 
      category: selectedCategory._id, 
      attributes: dynamicAttributes 
    });
    setLoading(false);
    if (res.success) { 
      closeModal(); 
      fetchData(); 
      Swal.fire("Saved", res.message, "success"); 
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", originalBarcode: "", supplier: "", buyingPrice: "", sellingPrice: "", stock: "", brand: "Generic", warranty: 0 });
    setSelectedCategory(null); 
    setDynamicAttributes({});
    setFilteredBrands([]);
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-amber-400 outline-none font-bold transition-all";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Stock Inventory</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Manage products & lot entries</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-4 bg-[#f9db3d] font-black rounded-2xl text-[10px] uppercase flex items-center gap-2 hover:bg-black hover:text-[#f9db3d] transition-all shadow-lg">
          <Plus size={18}/> New Lot Entry
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm">
          <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                  <tr>
                      <th className="px-8 py-5 tracking-widest">Product Details</th>
                      <th className="px-8 py-5 tracking-widest">Lot ID</th>
                      <th className="px-8 py-5 tracking-widest">Stock</th>
                      <th className="px-8 py-5 text-right tracking-widest">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-all font-bold text-sm">
                          <td className="px-8 py-5">
                            <span className="text-gray-900 block">{p.name}</span>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase border border-blue-100">
                                {p.supplier?.name || "Generic Supplier"}
                              </span>
                              <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{p.brand}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs text-gray-400 tracking-tighter">{p.barcodeId}</td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.stock > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {p.stock} Units
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                              <button onClick={() => deleteProductAction(p._id).then(fetchData)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={18}/>
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[40px] p-10 relative max-h-[95vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute right-8 top-8 text-gray-300 hover:text-black"><X size={28}/></button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-black uppercase flex items-center gap-3">
                  <Package className="text-amber-500" /> New Product Lot
                  {isIdentifying && <Loader2 className="animate-spin text-amber-500" size={24}/>}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className={labelClass}>Barcode Scan *</label>
                    <div className="relative">
                      <input className={`${inputClass} pr-12 border-amber-200 bg-amber-50/20`} value={formData.originalBarcode} onChange={e => setFormData({...formData, originalBarcode: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && runAIScan()} placeholder="Scan Code" />
                      <button onClick={runAIScan} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-amber-400 text-white rounded-xl shadow-lg shadow-amber-200"><Sparkles size={16}/></button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Product Name *</label>
                    <input className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Logitech G502" />
                  </div>
                </div>

                {/* Supplier Dropdown */}
                <div>
                  <label className={labelClass}>Select Supplier *</label>
                  <div className="relative">
                    <select className={`${inputClass} appearance-none`} value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})}>
                      <option value="">Choose a Supplier</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.companyName})</option>
                      ))}
                    </select>
                    <Truck className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select className={inputClass} value={selectedCategory?._id || ""} onChange={e => {
                      const cat = categories.find(c => c._id === e.target.value);
                      setSelectedCategory(cat);
                      if(cat) getBrandsByCategoryAction(cat._id).then(res => res.success && setFilteredBrands(res.data));
                    }}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Brand</label>
                    <select className={inputClass} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                      <option value="Generic">Generic</option>
                      {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 p-7 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div><label className={labelClass}>Buy Price</label><input type="number" className={inputClass} value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} /></div>
                  <div><label className={labelClass}>Sell Price</label><input type="number" className={inputClass} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} /></div>
                  <div><label className={labelClass}>Stock</label><input type="number" className={`${inputClass} bg-amber-400 border-none text-center`} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                </div>

                {/* --- Dynamic Fields --- */}
                {selectedCategory?.extraFields && selectedCategory.extraFields.length > 0 && (
                  <div className="p-7 bg-amber-50/30 rounded-[32px] border border-amber-100">
                    <label className="text-[10px] font-black text-amber-600 uppercase mb-4 block tracking-widest">Specifications</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCategory.extraFields.map((field: string) => (
                        <div key={field}>
                          <p className="text-[9px] font-black text-gray-400 ml-1 mb-1 uppercase">{field}</p>
                          <input 
                            className={`${inputClass} bg-white border-amber-100`} 
                            placeholder={`Value for ${field}`} 
                            value={dynamicAttributes[field] || ""} 
                            onChange={e => setDynamicAttributes({...dynamicAttributes, [field]: e.target.value})} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-black text-[#f9db3d] font-black uppercase rounded-2xl shadow-xl active:scale-[0.98] transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "Save Lot to Inventory"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductClient;