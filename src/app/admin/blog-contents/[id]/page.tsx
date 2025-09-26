'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import BlogContentDisplay from '@/components/BlogContentDisplay';

interface BlogContent {
  id: string;
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

interface BlogContentPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogContentPage({ params }: BlogContentPageProps) {
  const resolvedParams = use(params);
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          setError('You don\'t have permission to view this content');
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-content/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog content');
      }

      router.push('/admin/blog-contents');
    } catch (error) {
      console.error('Error deleting blog content:', error);
      alert('Failed to delete blog content');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user can edit this content
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
          <div className="space-x-4">
            <button
              onClick={fetchBlogContent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <Link
              href="/admin/blog-contents"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </Link>
          </div>
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
          <Link
            href="/blogs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back to Blog Contents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/blog-contents"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blog Content</h1>
                <p className="text-sm text-gray-500">
                  Created by {blogContent.createdBy.name || 'Anonymous'} • {formatDate(blogContent.createdAt)}
                  {blogContent.createdAt !== blogContent.updatedAt && (
                    <span className="ml-2 text-blue-600">(Edited {formatDate(blogContent.updatedAt)})</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canEdit && (
                <>
                  <Link
                    href={`/admin/blog-contents/${resolvedParams.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="max-w-none">
              <BlogContentDisplay content={blogContent.textContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
