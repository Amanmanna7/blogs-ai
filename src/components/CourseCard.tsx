'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description: string;
    subjectType: 'ACADEMIC' | 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'OTHER';
    chapterTopicCount: number;
    createdAt: string;
    progress?: {
      completedBlogs: number;
      totalBlogs: number;
      progressPercentage: number;
    };
  };
  index: number;
}

const subjectTypeDecorations = {
  ACADEMIC: {
    bubble1: 'from-blue-200/20 to-blue-300/10',
    bubble2: 'from-indigo-200/15 to-blue-200/10',
    bubble3: 'from-blue-300/10 to-indigo-200/15'
  },
  TECHNICAL: {
    bubble1: 'from-green-200/20 to-emerald-300/10',
    bubble2: 'from-emerald-200/15 to-green-200/10',
    bubble3: 'from-green-300/10 to-emerald-200/15'
  },
  CREATIVE: {
    bubble1: 'from-purple-200/20 to-violet-300/10',
    bubble2: 'from-violet-200/15 to-purple-200/10',
    bubble3: 'from-purple-300/10 to-violet-200/15'
  },
  BUSINESS: {
    bubble1: 'from-orange-200/20 to-amber-300/10',
    bubble2: 'from-amber-200/15 to-orange-200/10',
    bubble3: 'from-orange-300/10 to-amber-200/15'
  },
  OTHER: {
    bubble1: 'from-gray-200/20 to-slate-300/10',
    bubble2: 'from-slate-200/15 to-gray-200/10',
    bubble3: 'from-gray-300/10 to-slate-200/15'
  }
};

const subjectTypeColors = {
  ACADEMIC: 'bg-blue-100 text-blue-800 border-blue-200',
  TECHNICAL: 'bg-green-100 text-green-800 border-green-200',
  CREATIVE: 'bg-purple-100 text-purple-800 border-purple-200',
  BUSINESS: 'bg-orange-100 text-orange-800 border-orange-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200'
};

const subjectTypeLabels = {
  ACADEMIC: 'Academic',
  TECHNICAL: 'Technical',
  CREATIVE: 'Creative',
  BUSINESS: 'Business',
  OTHER: 'Other'
};

export default function CourseCard({ course, index }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const decorations = subjectTypeDecorations[course.subjectType];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subject-specific gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        course.subjectType === 'ACADEMIC' ? 'from-blue-50 to-indigo-50' :
        course.subjectType === 'TECHNICAL' ? 'from-green-50 to-emerald-50' :
        course.subjectType === 'CREATIVE' ? 'from-purple-50 to-violet-50' :
        course.subjectType === 'BUSINESS' ? 'from-orange-50 to-amber-50' :
        'from-gray-50 to-slate-50'
      } opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Subject Type Badge */}
        <div className="mb-4 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${subjectTypeColors[course.subjectType]}`}>
            {subjectTypeLabels[course.subjectType]}
          </span>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{course.chapterTopicCount} chapters</span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
          {course.name}
        </h3>

        {/* Course Description */}
        <p className="mb-6 text-gray-600 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Progress Display */}
        {course.progress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {course.progress.completedBlogs}/{course.progress.totalBlogs} Lesson{course.progress.totalBlogs !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{course.progress.progressPercentage}% Complete</span>
              {course.progress.progressPercentage === 100 && (
                <span className="text-green-600 font-medium">✓ Completed</span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>View Course</span>
            <svg 
              className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Course Stats */}
          <div className="text-xs text-gray-500">
            {new Date(course.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Subject-specific decorative bubbles */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${decorations.bubble1} transition-all duration-300 group-hover:scale-110`} />
      <div className={`absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-gradient-to-br ${decorations.bubble2} transition-all duration-300 group-hover:scale-110`} />
      <div className={`absolute top-1/2 right-1/4 h-12 w-12 rounded-full bg-gradient-to-br ${decorations.bubble3} transition-all duration-300 group-hover:scale-110`} />
    </div>
  );
}
