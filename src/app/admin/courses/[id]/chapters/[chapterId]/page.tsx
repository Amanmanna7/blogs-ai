'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, ArrowLeft, Trash2, Plus } from 'lucide-react';

interface ChapterTopic {
  id: string;
  courseId: string;
  sequenceNumber: number;
  name: string;
  description: string;
  course: {
    id: string;
    name: string;
  };
  blogRelations: Array<{
    id: string;
    sequence: number;
    blog: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

interface ChapterDetailPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

export default function ChapterDetailPage({ params }: ChapterDetailPageProps) {
  const [chapterTopic, setChapterTopic] = useState<ChapterTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    fetchChapterTopic();
  }, [resolvedParams.chapterId]);

  const fetchChapterTopic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chapter-topics/${resolvedParams.chapterId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Chapter topic not found');
        }
        throw new Error('Failed to fetch chapter topic');
      }
      
      const data = await response.json();
      setChapterTopic(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chapter topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!chapterTopic) return;
    
    if (!confirm(`Are you sure you want to delete "${chapterTopic.name}"? This will also delete all associated blog relations.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/chapter-topics/${chapterTopic.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter topic');
      }

      router.push(`/admin/courses/${resolvedParams.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter topic');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/admin/courses/${resolvedParams.id}`)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!chapterTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter topic not found</h2>
          <p className="text-gray-600 mb-4">The chapter topic you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/admin/courses/${resolvedParams.id}`)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/courses/${resolvedParams.id}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chapter {chapterTopic.sequenceNumber}: {chapterTopic.name}
              </h1>
              <p className="text-gray-600 mt-2">{chapterTopic.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Course: {chapterTopic.course.name}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/${resolvedParams.chapterId}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Chapter
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chapter
              </button>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Associated Blogs</h2>
            <p className="text-gray-600 text-sm">
              {chapterTopic.blogRelations.length} blog{chapterTopic.blogRelations.length !== 1 ? 's' : ''} in this chapter
            </p>
          </div>
          
          <div className="p-6">
            {chapterTopic.blogRelations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-600 mb-4">This chapter doesn't have any associated blogs</p>
                <button
                  onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/${resolvedParams.chapterId}/edit`)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Blogs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {chapterTopic.blogRelations
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((relation) => (
                    <div key={relation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {relation.sequence}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{relation.blog.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">
                              Blog sequence: {relation.sequence}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/blogs/${relation.blog.slug}`)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View Blog
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
