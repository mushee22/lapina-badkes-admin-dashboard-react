import React from "react";
import ThemeTogglerTwo from "../components/common/ThemeTogglerTwo";
import { Link } from "react-router";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 overflow-y-auto">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Lapina Bakes
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/support" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Support
            </Link>
            <div className="flex items-center">
              <ThemeTogglerTwo />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
          {children}
        </div>
      </main>

      <footer className="w-full bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Lapina Bakes. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
