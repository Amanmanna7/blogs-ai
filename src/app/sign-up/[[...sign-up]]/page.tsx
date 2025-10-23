'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/courses';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join KnowvloAI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start your AI-powered blogging journey
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            redirectUrl={redirectUrl}
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'shadow-lg bg-white border border-gray-200',
                headerTitle: 'text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
                formFieldInput: 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-500',
                formFieldLabel: 'text-gray-700',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
                identityPreviewText: 'text-gray-600',
                formResendCodeLink: 'text-blue-600 hover:text-blue-700',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
