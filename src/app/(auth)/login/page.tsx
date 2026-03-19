"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/img/MARK-GADGETS.png";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (res?.error) {
      // res.error এ authorize ফাংশন থেকে পাঠানো মেসেজ পাওয়া যাবে
      setError(res.error === "CredentialsSignin" ? "Invalid login details" : res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh(); // সেশন আপডেট নিশ্চিত করতে
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src={logo} 
              alt="Mark Gadget Logo" 
              width={180} 
              height={60} 
              className="object-contain" 
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Inventory Management System Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-gray-500 hover:text-black hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#f9db3d] focus:ring-[#f9db3d] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
              Remember me
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#f9db3d] px-4 py-3 text-sm font-bold text-black shadow-md hover:bg-[#e6c930] active:scale-95 transition-all flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                AUTHENTICATING...
              </div>
            ) : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}