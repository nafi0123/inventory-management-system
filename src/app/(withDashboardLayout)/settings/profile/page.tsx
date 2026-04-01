"use client";

import React, { useState } from "react";
import { User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { updatePasswordAction, updateUsernameAction } from "@/services/authActions";

const Profile = () => {
  // update ফাংশনটি এখান থেকে এক্সট্রাক্ট করা হয়েছে
  const { data: session, update } = useSession(); 
  const [showPass, setShowPass] = useState({ 
    current: false, 
    new: false, 
    confirm: false, 
    profileVer: false 
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const currentPassword = formData.get("currentPassword") as string;

    const res = await updateUsernameAction(username, currentPassword);
    
    if (res.success) {
      // সেশন আপডেট করা যাতে নেভবারে নাম সাথে সাথে বদলে যায়
      await update({ username: username });

      Swal.fire({ 
        icon: "success", 
        title: "Updated!", 
        text: res.message, 
        confirmButtonColor: "#f9db3d",
        customClass: { confirmButton: "swal-confirm-black-text" }
      });
      (e.target as HTMLFormElement).reset();
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.message });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPass = formData.get("oldPassword") as string;
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (newPass !== confirmPass) {
      return Swal.fire("Error", "New passwords do not match!", "error");
    }

    setLoading(true);
    const res = await updatePasswordAction(currentPass, newPass);
    setLoading(false);

    if (res.success) {
      Swal.fire({ 
        icon: "success", 
        title: "Changed!", 
        text: res.message, 
        confirmButtonColor: "#f9db3d",
        customClass: { confirmButton: "swal-confirm-black-text" }
      });
      (e.target as HTMLFormElement).reset();
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.message });
    }
  };

  // স্টাইলিং আগের মতোই আছে
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all";
  const labelClass = "block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";
  const btnClass = "w-full md:w-auto px-8 py-3 bg-[#f9db3d] hover:bg-[#e6c930] text-black font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center";

  return (
    <div className="space-y-6 pb-10 mt-2">
      {/* Profile Information Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Profile Information</h3>
            <p className="text-xs text-gray-400">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <input type="text" style={{ display: "none" }} aria-hidden="true" />
          <input type="password" style={{ display: "none" }} aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>User Name</label>
              <input 
                name="username" 
                type="text" 
                autoComplete="one-time-code"
                placeholder="Enter username" 
                className={inputClass} 
                required 
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input 
                type="email" 
                value={session?.user?.email || ""} 
                disabled 
                className={`${inputClass} bg-gray-100 cursor-not-allowed text-gray-400`} 
              />
            </div>
          </div>

          <div className="relative">
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <input 
                name="currentPassword" 
                type={showPass.profileVer ? "text" : "password"} 
                autoComplete="new-password"
                placeholder="Verify with current password" 
                className={inputClass} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPass({...showPass, profileVer: !showPass.profileVer})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass.profileVer ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Required to save profile changes.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-400">Security credentials for your account</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="relative">
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <input 
                name="oldPassword" 
                type={showPass.current ? "text" : "password"} 
                autoComplete="new-password"
                placeholder="Enter current password"
                className={inputClass} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPass({...showPass, current: !showPass.current})} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input 
                  name="newPassword" 
                  type={showPass.new ? "text" : "password"} 
                  autoComplete="new-password"
                  placeholder="Create new password"
                  className={inputClass} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, new: !showPass.new})} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <input 
                  name="confirmPassword" 
                  type={showPass.confirm ? "text" : "password"} 
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className={inputClass} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;