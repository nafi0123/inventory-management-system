"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/img/MARK-GADGETS.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false, // we'll handle redirect manually
      username,
      password,
      // remember me option
      // by default JWT session will persist, cookie maxAge used below
    });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      // redirect to dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="Mark Gadget Logo" width={180} height={60} className="object-contain" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
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
              name="remember-me"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#f9db3d] focus:ring-[#f9db3d]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#f9db3d] px-4 py-3 text-sm font-bold text-black shadow-md hover:bg-[#e6c930] focus:outline-none focus:ring-2 focus:ring-[#f9db3d] focus:ring-offset-2 transition-all"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}