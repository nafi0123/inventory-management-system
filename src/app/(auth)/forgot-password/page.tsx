"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // আইকনের জন্য

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Success! Check your email for the reset link.");
        setIsError(false);
      } else {
        setMessage(data.error || "Something went wrong. Try again.");
        setIsError(true);
      }
    } catch (err) {
      setMessage("Connection error. Please check your internet.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-lg rounded-2xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your registered email"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg bg-[#f9db3d] text-sm font-bold text-black shadow-md hover:bg-[#e6c930] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#f9db3d] focus:ring-offset-2 transition-all flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                SENDING...
              </div>
            ) : (
              "SEND RESET LINK"
            )}
          </button>

          {/* Back to Login Button */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-gray-600 hover:text-black transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}