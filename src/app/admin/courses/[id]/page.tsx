'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectType, CourseStatus } from '@prisma/client';
import { Edit, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  subjectType: SubjectType;
  status: CourseStatus;
  createdAt: string;
  chapterTopics?: Array<{
    id: string;
    name: string;
    description: string;
    sequenceNumber: number;
  }>;
  _count?: {
    chapterTopics: number;
  };
}

const subjectTypeLabels = {
  [SubjectType.ACADEMIC]: 'Academic',
  [SubjectType.TECHNICAL]: 'Technical',
  [SubjectType.CREATIVE]: 'Creative',
  [SubjectType.BUSINESS]: 'Business',
  [SubjectType.OTHER]: 'Other',
};

const courseStatusLabels = {
  [CourseStatus.DRAFT]: 'Draft',
  [CourseStatus.LIVE]: 'Live',
  [CourseStatus.ARCHIVED]: 'Archived',
  [CourseStatus.COMING_SOON]: 'Coming Soon',
};

const statusColors = {
  [CourseStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [CourseStatus.LIVE]: 'bg-green-100 text-green-800',
  [CourseStatus.ARCHIVED]: 'bg-red-100 text-red-800',
  [CourseStatus.COMING_SOON]: 'bg-blue-100 text-blue-800',
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Unwrap the params Promise
  const resolvedParams = use(params);

  useEffect(() => {
    fetchCourse();
  }, [resolvedParams.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${resolvedParams.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found');
        }
        throw new Error('Failed to fetch course');
      }
      
      const result = await response.json();
      if (result.success) {
        setCourse(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string, chapterName: string) => {
    if (!confirm(`Are you sure you want to delete the chapter "${chapterName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${resolvedParams.id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      // Refresh the course data after deletion
      await fetchCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter');
    }
  };

  const handleDelete = async () => {
    if (!course) return;
    
    if (!confirm(`Are you sure you want to delete "${course.name}"? This will also delete all associated chapters.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
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
            onClick={() => router.push('/admin/courses')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/courses')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
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
            onClick={() => router.push('/admin/courses')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/admin/courses/${resolvedParams.id}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Course
              </button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
              <p className="text-sm text-gray-900">{subjectTypeLabels[course.subjectType]}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[course.status]}`}>
                {courseStatusLabels[course.status]}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-sm text-gray-900">{new Date(course.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Chapters</h2>
                <p className="text-gray-600 text-sm">
                  {course.chapterTopics?.length || 0} chapter{(course.chapterTopics?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/create`)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {(course.chapterTopics?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
                <p className="text-gray-600 mb-4">Start building your course by adding chapters</p>
                <button
                  onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/create`)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Chapter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(course.chapterTopics || [])
                  .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                  .map((chapter, index) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {chapter.sequenceNumber}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{chapter.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{chapter.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3 items-center">
                        <button
                          onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/${chapter.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                          title="Edit chapter"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => router.push(`/admin/courses/${resolvedParams.id}/chapters/${chapter.id}`)}
                          className="text-green-600 hover:text-green-900 text-sm flex items-center"
                          title="View chapter"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chapter.id, chapter.name);
                          }}
                          className="text-red-600 hover:text-red-900 text-sm flex items-center"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span>Delete</span>
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
