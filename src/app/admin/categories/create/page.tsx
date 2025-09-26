'use client';

import { useRole } from '@/hooks/useRole';
import CategoryForm from '@/components/CategoryForm';

export default function CreateCategoryPage() {
  const { isAdmin, isEditor, isAuthor } = useRole();

  // Check if user has permission
  if (!isAdmin && !isEditor && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to create categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryForm />
      </div>
    </div>
  );
}
