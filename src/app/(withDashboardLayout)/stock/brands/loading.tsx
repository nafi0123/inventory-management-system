import React from "react";
import { Search, Tag, Plus } from "lucide-react";

const BrandLoading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-200">
            <Tag size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
            <div className="h-3 w-48 bg-gray-100 rounded-md"></div>
          </div>
        </div>
        <div className="w-32 h-11 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Stats & Search Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative h-12 bg-white rounded-2xl border border-gray-100">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 rounded-full"></div>
        </div>
        <div className="bg-gray-200 rounded-2xl p-4 h-16 flex items-center justify-between">
            <div className="h-3 w-20 bg-gray-300 rounded-md opacity-50"></div>
            <div className="h-6 w-10 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[460px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 h-4 w-1/3 bg-gray-50/80"></th>
                <th className="px-8 py-5 h-4 w-1/3 bg-gray-50/80"></th>
                <th className="px-8 py-5 h-4 w-1/3 bg-gray-50/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-6"><div className="h-4 w-32 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-8 py-6"><div className="h-6 w-24 bg-gray-50 rounded-lg"></div></td>
                  <td className="px-8 py-6 text-right"><div className="h-9 w-9 bg-gray-50 rounded-xl ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl"></div>
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLoading;