"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password updated! Redirecting to login...");
        setIsError(false);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setMessage(data.error || "Failed to update password.");
        setIsError(true);
      }
    } catch (err) {
      setMessage("Connection error. Try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-lg rounded-2xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your new password below to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in duration-300 ${
              isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
            }`}>
              {message}
            </div>
          )}

          {/* Update Button */}
          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full py-3 rounded-lg bg-[#f9db3d] text-sm font-bold text-black shadow-md hover:bg-[#e6c930] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#f9db3d] focus:ring-offset-2 transition-all flex justify-center items-center ${
              loading || !token ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                UPDATING...
              </div>
            ) : (
              "UPDATE PASSWORD"
            )}
          </button>

          {!token && (
            <p className="text-xs text-red-500 text-center mt-2">
              Invalid or missing reset token. Please request a new link.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// Next.js এ useSearchParams ব্যবহার করলে Suspense দিয়ে র‍্যাপ করা বেস্ট প্র্যাকটিস
export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}