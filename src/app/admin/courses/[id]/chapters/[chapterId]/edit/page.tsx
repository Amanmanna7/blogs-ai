'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ChapterTopicForm from '@/components/ChapterTopicForm';

interface EditChapterPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

export default function EditChapterPage({ params }: EditChapterPageProps) {
  const [chapterTopic, setChapterTopic] = useState(null);
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
    <ChapterTopicForm 
      initialData={chapterTopic}
      isEditing={true}
    />
  );
}
