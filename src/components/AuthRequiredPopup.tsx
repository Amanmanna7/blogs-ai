'use client';

import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function AuthRequiredPopup({ isOpen, onClose, redirectUrl }: AuthRequiredPopupProps) {
  if (!isOpen) return null;

  const handleSignIn = () => {
    const currentUrl = window.location.href;
    const signInUrl = `/sign-in?redirect=${encodeURIComponent(redirectUrl || currentUrl)}`;
    window.location.href = signInUrl;
  };

  const handleSignUp = () => {
    const currentUrl = window.location.href;
    const signUpUrl = `/sign-up?redirect=${encodeURIComponent(redirectUrl || currentUrl)}`;
    window.location.href = signUpUrl;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign In Required</h3>
                <p className="text-sm text-gray-600">Access your personal notes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Notes Feature</h4>
            <p className="text-gray-600 leading-relaxed">
              The notes feature is available only for logged-in users. Sign in to access your personal notes, sync them across devices, and never lose your important thoughts.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-3 text-center">What you'll get:</h5>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Create and manage unlimited notes</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Sync notes across all your devices</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Rich text editing with formatting</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Organize notes with titles and search</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </button>
            
            <button
              onClick={handleSignUp}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
