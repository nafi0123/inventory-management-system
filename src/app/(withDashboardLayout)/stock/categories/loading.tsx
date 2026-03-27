// src/app/(withDashboardLayout)/stock/categories/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded-lg w-32" />
            <div className="h-3 bg-gray-100 rounded-lg w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-100 rounded-xl" />
          <div className="h-10 w-36 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-black/5 rounded-2xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 h-[460px]" />
    </div>
  );
}