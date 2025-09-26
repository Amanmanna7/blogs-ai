'use client';

import { useRole } from '@/hooks/useRole';
import BlogForm from '@/components/BlogForm';

export default function CreateBlogPage() {
  const { isAdmin, isEditor, isAuthor } = useRole();

  // Check if user has permission after all hooks are called
  if (!isAdmin && !isEditor && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to create blogs.</p>
        </div>
      </div>
    );
  }

  return <BlogForm />;
}
