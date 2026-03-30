import React from "react";
import { Package, Search, LayoutGrid } from "lucide-react";

const ProductLoading = () => {
  return (
    <div className="space-y-6 animate-pulse pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100"></div>
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
            <div className="h-3 w-56 bg-gray-100 rounded"></div>
          </div>
        </div>
        <div className="w-32 h-11 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 h-12 bg-white rounded-xl border border-gray-100"></div>
        <div className="h-12 bg-white rounded-xl border border-gray-100"></div>
        <div className="h-12 bg-black rounded-xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-4 w-48 bg-gray-100 rounded"></div>
              <div className="h-3 w-32 bg-gray-50 rounded"></div>
            </div>
            <div className="h-10 w-40 bg-gray-50 rounded-xl"></div>
            <div className="h-10 w-24 bg-gray-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductLoading;