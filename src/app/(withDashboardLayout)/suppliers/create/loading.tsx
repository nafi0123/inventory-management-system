import React from "react";
import { Truck } from "lucide-react";

const AddSupplierLoading = () => {
  return (
    <div className="space-y-6 pb-10 mt-2 animate-pulse">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-200">
            <Truck size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded-md w-40" />
            <div className="h-3 bg-gray-50 rounded-md w-64" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Input Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24 ml-1" />
                <div className="h-12 bg-gray-50 border border-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>

          {/* Full Width Address Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-24 ml-1" />
            <div className="h-12 bg-gray-50 border border-gray-100 rounded-xl w-full" />
          </div>

          {/* Button Skeleton */}
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <div className="h-12 bg-gray-100 rounded-xl w-full md:w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierLoading;