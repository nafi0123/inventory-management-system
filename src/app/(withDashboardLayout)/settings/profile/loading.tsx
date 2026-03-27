import React from "react";
import { User, ShieldCheck } from "lucide-react";

const ProfileLoading = () => {
  const labelSkeleton = "h-3 bg-gray-100 rounded-lg w-24 mb-3 ml-1";
  const inputSkeleton = "w-full h-[46px] bg-gray-50 border border-gray-100 rounded-xl animate-pulse";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 mt-2 animate-pulse">
      
      {/* Profile Information Card Skeleton */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
            <User size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded-lg w-40" />
            <div className="h-3 bg-gray-50 rounded-lg w-32" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={labelSkeleton} />
              <div className={inputSkeleton} />
            </div>
            <div>
              <div className={labelSkeleton} />
              <div className={inputSkeleton} />
            </div>
          </div>

          <div>
            <div className={labelSkeleton} />
            <div className={inputSkeleton} />
            <div className="h-2 bg-gray-50 rounded-lg w-48 mt-3 ml-1" />
          </div>

          <div className="flex justify-end pt-2">
            <div className="h-12 w-full md:w-40 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Change Password Card Skeleton */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded-lg w-44" />
            <div className="h-3 bg-gray-50 rounded-lg w-36" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className={labelSkeleton} />
            <div className={inputSkeleton} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={labelSkeleton} />
              <div className={inputSkeleton} />
            </div>
            <div>
              <div className={labelSkeleton} />
              <div className={inputSkeleton} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="h-12 w-full md:w-44 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProfileLoading;