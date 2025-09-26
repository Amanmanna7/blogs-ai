'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, Plus, Search, Filter } from 'lucide-react';

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
    };
  }>;
}

export default function ChapterTopicsPage() {
  const [chapterTopics, setChapterTopics] = useState<ChapterTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [searchTerm, courseFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (courseFilter) params.append('courseId', courseFilter);
      
      const [chapterTopicsRes, coursesRes] = await Promise.all([
        fetch(`/api/chapter-topics?${params.toString()}`),
        fetch('/api/courses')
      ]);
      
      if (!chapterTopicsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [chapterTopicsData, coursesData] = await Promise.all([
        chapterTopicsRes.json(),
        coursesRes.json()
      ]);

      setChapterTopics(chapterTopicsData.data || []);
      setCourses(coursesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterTopic: ChapterTopic) => {
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

      // Remove from local state
      setChapterTopics(chapterTopics.filter(c => c.id !== chapterTopic.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter topic');
    }
  };

  const handleView = (chapterTopic: ChapterTopic) => {
    router.push(`/admin/courses/${chapterTopic.courseId}/chapters/${chapterTopic.id}`);
  };

  const handleEdit = (chapterTopic: ChapterTopic) => {
    router.push(`/admin/courses/${chapterTopic.courseId}/chapters/${chapterTopic.id}/edit`);
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
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chapter Topics</h1>
              <p className="text-gray-600">Manage chapter topics across all courses</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search chapter topics..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="courseFilter"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chapter Topics List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {chapterTopics.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapter topics found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || courseFilter 
                    ? 'Try adjusting your filters' 
                    : 'Get started by creating your first chapter topic'
                  }
                </p>
                <button
                  onClick={() => router.push('/admin/courses')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Go to Courses
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chapter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blogs
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chapterTopics.map((chapterTopic) => (
                      <tr key={chapterTopic.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Chapter {chapterTopic.sequenceNumber}: {chapterTopic.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {chapterTopic.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {chapterTopic.course.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {chapterTopic.blogRelations.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(chapterTopic)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View chapter topic"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(chapterTopic)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit chapter topic"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(chapterTopic)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete chapter topic"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
