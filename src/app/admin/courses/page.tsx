'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseTable from '@/components/CourseTable';
import CourseForm from '@/components/CourseForm';
import { SubjectType } from '@prisma/client';

interface Course {
  id: string;
  name: string;
  description: string;
  subjectType: SubjectType;
  status: string;
  createdAt: string;
  _count: {
    chapterTopics: number;
  };
}

export default function CoursesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const router = useRouter();

  const handleCreateNew = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleView = (course: Course) => {
    router.push(`/admin/courses/${course.id}`);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCourse(null);
    // The CourseTable will automatically refresh
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (showForm) {
    return (
      <CourseForm
        initialData={editingCourse || undefined}
        isEditing={!!editingCourse}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <CourseTable
          onEdit={handleEdit}
          onView={handleView}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  );
}
