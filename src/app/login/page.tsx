'use client';

import React from 'react';
import Image from 'next/image';
import logo from '@/assets/img/MARK-GADGETS.png';

const LoginPage = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic for NextAuth signIn will go here
    console.log('NextAuth login triggered');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {/* Using the imported logo */}
            <Image 
              src={logo} 
              alt="Mark Gadget Logo" 
              width={180} 
              height={60} 
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
              placeholder="name@example.com"
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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#f9db3d] focus:outline-none focus:ring-2 focus:ring-[#f9db3d]/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#f9db3d] focus:ring-[#f9db3d]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
              Remember me
            </label>
          </div>

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
};

export default LoginPage;