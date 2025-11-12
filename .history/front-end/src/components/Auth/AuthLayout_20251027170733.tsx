import React from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: React.ReactNode;
  imageContent: React.ReactNode;
};

export function AuthLayout({ children, imageContent }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-beige-100">
      <div className="relative flex w-full max-w-6xl m-4 overflow-hidden bg-white shadow-2xl rounded-2xl">
        <Link
          to="/"
          className="absolute z-20 px-4 py-2 text-sm font-medium transition-colors rounded-lg top-6 left-6 text-beige-700 bg-beige-100 hover:bg-beige-200"
        >
          ← Back to Home
        </Link>

        {/* Form Section */}
        <div className="w-full p-8 lg:w-1/2 lg:pt-16">{children}</div>

        {/* Image Section */}
        <div className="relative items-center justify-center hidden w-1/2 p-12 text-white lg:flex bg-beige-800">
          {imageContent}
        </div>
      </div>
    </div>
  );
}
