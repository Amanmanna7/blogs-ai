'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectType } from '@prisma/client';

interface CourseFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string;
    subjectType: SubjectType;
    status: string;
  };
  isEditing?: boolean;
}

const subjectTypeLabels = {
  [SubjectType.ACADEMIC]: 'Academic',
  [SubjectType.TECHNICAL]: 'Technical',
  [SubjectType.CREATIVE]: 'Creative',
  [SubjectType.BUSINESS]: 'Business',
  [SubjectType.OTHER]: 'Other',
};

const courseStatusLabels = {
  'DRAFT': 'Draft',
  'LIVE': 'Live',
  'ARCHIVED': 'Archived',
  'COMING_SOON': 'Coming Soon',
};

export default function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    subjectType: initialData?.subjectType || SubjectType.ACADEMIC,
    status: initialData?.status || 'DRAFT',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing ? `/api/courses/${initialData?.id}` : '/api/courses';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course');
      }

      const course = await response.json();
      
      // Redirect to course detail page for new courses, or courses list for edits
      if (isEditing) {
        router.push('/admin/courses');
      } else {
        router.push(`/admin/courses/${course.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update course information' : 'Fill in the details to create a new course'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Course Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Course Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course name"
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
              placeholder="Enter course description"
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Subject Type and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Type */}
            <div>
              <label htmlFor="subjectType" className="block text-sm font-medium text-gray-700 mb-2">
                Subject Type *
              </label>
              <select
                id="subjectType"
                value={formData.subjectType}
                onChange={(e) => handleInputChange('subjectType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              >
                {Object.values(SubjectType).map((type) => (
                  <option key={type} value={type}>
                    {subjectTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              >
                {Object.keys(courseStatusLabels).map((status) => (
                  <option key={status} value={status}>
                    {courseStatusLabels[status as keyof typeof courseStatusLabels]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Draft:</strong> Course is being developed and not visible to students</p>
              <p><strong>Live:</strong> Course is published and available to students</p>
              <p><strong>Archived:</strong> Course is no longer active but remains accessible</p>
              <p><strong>Coming Soon:</strong> Course is announced but not yet available</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
              disabled={!formData.name.trim() || !formData.description.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Update Course' : 'Create Course'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
