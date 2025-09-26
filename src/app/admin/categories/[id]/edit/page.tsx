'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import CategoryForm from '@/components/CategoryForm';

interface Category {
  id: string;
  name: string;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, isEditor, isAuthor } = useRole();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/categories/${resolvedParams.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Category not found');
          } else {
            setError('Failed to load category');
          }
          return;
        }

        const data = await response.json();
        setCategory(data.category);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params]);

  // Check if user has permission after all hooks are called
  if (!isAdmin && !isEditor && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit categories.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryForm initialData={category} isEditing={true} />
      </div>
    </div>
  );
}
