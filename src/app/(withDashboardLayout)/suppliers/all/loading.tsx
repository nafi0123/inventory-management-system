import React from "react";
import { Truck, Search, LayoutGrid } from "lucide-react";

const Loading = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-200">
            <Truck size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded-md w-32" />
            <div className="h-3 bg-gray-50 rounded-md w-48" />
          </div>
        </div>
        <div className="h-12 bg-gray-100 rounded-2xl w-44" />
      </div>

      {/* Search & Stats Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-pulse">
        <div className="lg:col-span-3 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200">
            <Search size={18} />
          </div>
          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl h-[46px]" />
        </div>
        <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between border border-gray-200">
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded w-10" />
        </div>
      </div>

      {/* Table Section Skeleton */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5"><div className="h-3 bg-gray-100 rounded w-24" /></th>
                <th className="px-8 py-5"><div className="h-3 bg-gray-100 rounded w-32" /></th>
                <th className="px-8 py-5 text-right"><div className="h-3 bg-gray-100 rounded w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(7)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32" />
                        <div className="h-3 bg-gray-50 rounded w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-36" />
                      <div className="h-3 bg-gray-50 rounded w-28" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <div className="w-9 h-9 bg-gray-50 rounded-xl" />
                      <div className="w-9 h-9 bg-gray-50 rounded-xl" />
                      <div className="w-9 h-9 bg-gray-50 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 mt-auto">
          <div className="h-3 bg-gray-100 rounded w-32" />
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl" />
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;