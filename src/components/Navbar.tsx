'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import DashboardDropdown from './DashboardDropdown';

export default function Navbar() {
  const { user, hasPermission } = useRole();

  return (
    <nav className="bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-indigo-50/90 backdrop-blur-md border-b border-blue-100/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                KnowvloAI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
            </Link>
            <Link 
              href="/blogs" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
            </Link>
            <Link 
              href="/courses" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
            >
              <span className="relative z-10">Courses</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
            </Link>
            
            {/* Dashboard Dropdown - Only visible to admin, editor, and author */}
            <DashboardDropdown />
            <Link 
              href="/about" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
            </Link>
            
            {/* Admin Link - Only visible to admins */}
            {hasPermission('MANAGE_USERS') && (
              <Link 
                href="/admin" 
                className="relative px-4 py-2 text-gray-700 hover:text-red-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
              >
                <span className="relative z-10">Admin</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-100/80 to-orange-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
              </Link>
            )}
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-3">
            <SignedOut>
              <SignInButton 
                mode="redirect"
                forceRedirectUrl="/sign-in"
              >
                <button className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200/50 backdrop-blur-sm border border-white/20">
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-blue-200/50 hover:ring-blue-400/70 transition-all duration-300 shadow-lg hover:shadow-xl",
                    userButtonPopoverCard: "bg-white/95 backdrop-blur-md border border-blue-100/50 shadow-xl rounded-xl overflow-hidden",
                    userButtonPopoverActionButton: "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200",
                    userButtonPopoverActionButtonText: "text-gray-700 font-medium",
                    userButtonPopoverFooter: "bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-t border-blue-100/50",
                    userButtonPopoverUserInfo: "bg-gradient-to-r from-blue-50/80 to-purple-50/80",
                    userButtonPopoverUserInfoText: "text-gray-900 font-semibold",
                    userButtonPopoverUserInfoSecondaryText: "text-gray-600",
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
