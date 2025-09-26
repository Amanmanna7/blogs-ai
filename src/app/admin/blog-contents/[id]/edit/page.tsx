'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import BlogContentForm from '@/components/BlogContentForm';
import { useRole } from '@/hooks/useRole';

interface BlogContent {
  id: string;
  name: string;
  slug: string;
  textContent: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
}

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { user, isAuthor, isEditor } = useRole();

  useEffect(() => {
    fetchBlogContent();
  }, [resolvedParams.id]);

  const fetchBlogContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog-content/${resolvedParams.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog content not found');
        } else if (response.status === 403) {
          setError('You don\'t have permission to edit this content');
        } else {
          setError('Failed to load blog content');
        }
        return;
      }
      
      const data = await response.json();
      setBlogContent(data.blogContent);
    } catch (error) {
      console.error('Error fetching blog content:', error);
      setError('Failed to load blog content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { name: string; slug: string; content: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/blog-content/${resolvedParams.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update blog content');
      }

      router.push(`/admin/blog-contents/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error updating blog content:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };


  // Check if user has permission to edit
  const canEdit = blogContent && (isEditor || blogContent.createdBy.id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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

  if (!blogContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Content Not Found</h1>
          <p className="text-gray-600 mb-6">The blog content you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/blog-contents')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back to Blog Contents
          </button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit this blog content.</p>
          <button
            onClick={() => router.push(`/admin/blog-contents/${resolvedParams.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogContentForm
        initialContent={blogContent.textContent}
        initialName={blogContent.name}
        initialSlug={blogContent.slug}
        onSave={handleSave}
        isEditing={true}
        contentId={blogContent.id}
      />
    </div>
  );
}
