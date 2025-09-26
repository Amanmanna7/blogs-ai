'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogContentForm from '@/components/BlogContentForm';
import { useRole } from '@/hooks/useRole';

export default function CreateBlogPage() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { isAuthor, isEditor } = useRole();

  const handleSave = async (data: { name: string; slug: string; content: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/blog-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: data.name,
          slug: data.slug,
          textContent: data.content 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blog content');
      }

      const responseData = await response.json();
      router.push(`/admin/blog-contents/${responseData.blogContent.id}`);
    } catch (error) {
      console.error('Error saving blog content:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };


  // Check if user has permission to create content
  if (!isAuthor && !isEditor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to create blog content.</p>
          <button
            onClick={() => router.push('/admin/blog-contents')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogContentForm
        onSave={handleSave}
        isEditing={false}
      />
    </div>
  );
}
