'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Course, Blog } from '@prisma/client';
import { Plus, X, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface ChapterTopicFormProps {
  initialData?: {
    id: string;
    courseId: string;
    sequenceNumber: number;
    name: string;
    description: string;
    blogRelations: Array<{
      id: string;
      blogId: string;
      sequence: number;
      blog: Blog;
    }>;
  };
  isEditing?: boolean;
  courseId?: string;
}

interface BlogSequence {
  id: string;
  sequence: number;
  blogId: string;
  blog: Blog;
}

export default function ChapterTopicForm({ 
  initialData, 
  isEditing = false, 
  courseId 
}: ChapterTopicFormProps) {
  const [formData, setFormData] = useState({
    courseId: initialData?.courseId || courseId || '',
    sequenceNumber: initialData?.sequenceNumber || 1,
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  
  const [blogSequences, setBlogSequences] = useState<BlogSequence[]>(
    initialData?.blogRelations?.map(rel => ({
      id: rel.id,
      sequence: rel.sequence,
      blogId: rel.blogId,
      blog: rel.blog
    })) || []
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, blogsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/blogs/public')
      ]);

      if (!coursesRes.ok || !blogsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [coursesData, blogsData] = await Promise.all([
        coursesRes.json(),
        blogsRes.json()
      ]);

      console.log('Courses data:', coursesData);
      console.log('Blogs data:', blogsData);

      setCourses(coursesData.data || []);
      setBlogs(blogsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing ? `/api/chapter-topics/${initialData?.id}` : '/api/chapter-topics';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          blogSequences: blogSequences.map(seq => ({
            blogId: seq.blogId,
            sequence: seq.sequence
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save chapter topic');
      }

      const chapterTopic = await response.json();
      
      // Redirect to course detail page
      router.push(`/admin/courses/${formData.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chapter topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBlogSequence = () => {
    const nextSequence = Math.max(...blogSequences.map(s => s.sequence), 0) + 1;
    const newSequence: BlogSequence = {
      id: `temp-${Date.now()}`,
      sequence: nextSequence,
      blogId: '',
      blog: {} as Blog
    };
    setBlogSequences([...blogSequences, newSequence]);
  };

  const updateBlogSequence = (id: string, updates: Partial<BlogSequence>) => {
    setBlogSequences(blogSequences.map(seq => {
      if (seq.id === id) {
        const updatedSeq = { ...seq, ...updates };
        
        // If blog is selected, populate the blog data
        if (updates.blogId) {
          const selectedBlog = blogs.find(b => b.id === updates.blogId);
          if (selectedBlog) {
            updatedSeq.blog = selectedBlog;
          }
        }
        
        return updatedSeq;
      }
      return seq;
    }));
  };

  const removeBlogSequence = (id: string) => {
    const newSequences = blogSequences.filter(seq => seq.id !== id);
    // Reorder sequences
    const reorderedSequences = newSequences
      .sort((a, b) => a.sequence - b.sequence)
      .map((seq, index) => ({ ...seq, sequence: index + 1 }));
    setBlogSequences(reorderedSequences);
  };

  const moveBlogSequence = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    
    const draggedSequence = blogSequences[dragIndex];
    const newSequences = [...blogSequences];
    newSequences.splice(dragIndex, 1);
    newSequences.splice(hoverIndex, 0, draggedSequence);
    
    // Update sequence numbers
    const reorderedSequences = newSequences.map((seq, index) => ({
      ...seq,
      sequence: index + 1
    }));
    
    setBlogSequences(reorderedSequences);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      moveBlogSequence(dragIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Chapter Topic' : 'Create Chapter Topic'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update chapter topic information' : 'Fill in the details to create a new chapter topic'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  id="courseId"
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting || !!courseId}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sequence Number */}
              <div>
                <label htmlFor="sequenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Number *
                </label>
                <input
                  type="number"
                  id="sequenceNumber"
                  value={formData.sequenceNumber}
                  onChange={(e) => handleInputChange('sequenceNumber', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Chapter Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter description"
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Blog Sequences Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Blog Sequences</h3>
                  <button
                    type="button"
                    onClick={addBlogSequence}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Blog
                  </button>
                </div>

                {blogs.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          No Blogs Available
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>You need to create some blogs before you can add them to chapter topics.</p>
                          <p className="mt-1">
                            <a href="/admin/blogs" className="font-medium underline text-yellow-800 hover:text-yellow-900">
                              Go to Blogs Management →
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {blogSequences.map((sequence, index) => (
                    <div
                      key={sequence.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-200 cursor-move ${
                        draggedIndex === index 
                          ? 'opacity-50 transform rotate-2 scale-105 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {sequence.sequence}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Blog {sequence.sequence}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBlogSequence(sequence.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <select
                        value={sequence.blogId}
                        onChange={(e) => updateBlogSequence(sequence.id, { blogId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select a blog</option>
                        {blogs.length === 0 ? (
                          <option value="" disabled>No blogs available</option>
                        ) : (
                          blogs.map((blog) => (
                            <option key={blog.id} value={blog.id}>
                              {blog.title} [{blog.status}]
                            </option>
                          ))
                        )}
                      </select>

                      {sequence.blog && sequence.blog.title && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600">
                            <strong>Selected:</strong> {sequence.blog.title} 
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              sequence.blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                              sequence.blog.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sequence.blog.status}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.courseId || !formData.name.trim() || !formData.description.trim() || isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? 'Update Chapter Topic' : 'Create Chapter Topic'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {showPreview && (
            <div className="p-6">
              {selectedCourse ? (
                <div className="space-y-4">
                  {/* Course Name */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h1 className="text-xl font-bold text-blue-900">
                      {selectedCourse.name}
                    </h1>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Chapter Topic */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Chapter {formData.sequenceNumber}: {formData.name || 'Chapter Name'}
                      </h2>
                      <details className="group" open>
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 flex items-center">
                          <span className="mr-2">
                            <ChevronDown className="w-4 h-4" />
                          </span>
                          {formData.description || 'Chapter description will appear here'}
                        </summary>
                        <div className="mt-2 pl-4 border-l-2 border-gray-300">
                          <div className="space-y-2">
                            {blogSequences
                              .filter(seq => seq.blogId && seq.blog.title)
                              .sort((a, b) => a.sequence - b.sequence)
                              .map((sequence) => (
                                <div key={sequence.id} className="text-sm text-gray-700 flex items-center">
                                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 mr-2">
                                    {sequence.sequence}
                                  </span>
                                  {sequence.blog.title}
                                </div>
                              ))}
                            {blogSequences.filter(seq => seq.blogId && seq.blog.title).length === 0 && (
                              <p className="text-sm text-gray-500 italic">No blogs added yet</p>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Select a course to see preview</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
