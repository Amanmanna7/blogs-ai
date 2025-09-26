'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import BlogForm from '@/components/BlogForm';

interface Blog {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categories: {
    id: string;
    name: string;
  }[];
  sequences: {
    id: string;
    sequence: number;
    type: 'content' | 'media';
    blogContentId?: string;
    blogMediaId?: string;
  }[];
}

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, isEditor, isAuthor } = useRole();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/blogs/${resolvedParams.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog not found');
          } else {
            setError('Failed to load blog');
          }
          return;
        }

        const data = await response.json();
        
        // Transform the categories to match the expected format
        const transformedBlog = {
          ...data.blog,
          categories: data.blog.categories.map((cat: any) => ({
            id: cat.category.id,
            name: cat.category.name
          }))
        };
        setBlog(transformedBlog);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

  // Check if user has permission after all hooks are called
  if (!isAdmin && !isEditor && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit blogs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <BlogForm initialData={blog} isEditing={true} />;
}
