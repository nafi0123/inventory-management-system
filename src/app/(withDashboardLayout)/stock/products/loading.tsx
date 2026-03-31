import React from "react";
import { LayoutGrid, Plus, Search, Filter, Package } from "lucide-react";

const Loading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* UI Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
            <LayoutGrid size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded-md w-40" />
            <div className="h-3 bg-gray-100 rounded-md w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
          <div className="h-10 w-36 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200">
            <Search size={18} />
          </div>
          <div className="h-11 bg-gray-50 border border-gray-100 rounded-xl w-full" />
        </div>
        <div className="lg:col-span-3">
          <div className="h-11 bg-gray-50 border border-gray-100 rounded-xl w-full flex items-center px-3">
            <Filter size={16} className="text-gray-200 mr-2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="h-11 bg-gray-50 border border-gray-100 rounded-xl w-full flex items-center px-3">
            <Package size={16} className="text-gray-200 mr-2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
        <div className="lg:col-span-2 bg-gray-900 rounded-xl h-11" />
      </div>

      {/* Inventory Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-5 flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        
        <div className="divide-y divide-gray-50">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-8 py-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-48" />
                <div className="h-3 bg-gray-50 rounded w-32" />
              </div>
              <div className="h-4 bg-gray-50 rounded w-24 hidden md:block" />
              <div className="h-6 bg-gray-50 rounded-full w-20" />
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-gray-50 rounded-lg" />
                <div className="h-9 w-9 bg-gray-50 rounded-lg" />
                <div className="h-9 w-9 bg-gray-50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-50 rounded-xl" />
          <div className="h-9 w-9 bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Loading;