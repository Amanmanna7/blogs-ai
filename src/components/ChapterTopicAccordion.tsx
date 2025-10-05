'use client';

import { useState } from 'react';
import Link from 'next/link';
import AssessmentStatus from './AssessmentStatus';

interface ChapterTopicAccordionProps {
  chapterTopic: {
    id: string;
    name: string;
    description: string;
    displayNumber: number;
    blogs: {
      id: string;
      title: string;
      slug: string;
      publishedAt: string | null;
      sequence: number;
    }[];
  };
  isOpen?: boolean;
  subjectType?: 'ACADEMIC' | 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'OTHER';
  progress?: {
    status: string;
    completedAt?: Date;
  } | null;
  completedBlogs?: number;
  totalBlogs?: number;
  blogProgress?: Array<{
    blogId: string;
    status: string;
    completedAt?: Date;
  }>;
  assessments?: {
    id: string;
    status: string;
    title: string | null;
    totalQuestions: number;
    blogId: string;
    chapterTopicId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  readingTime?: number;
}

const subjectTypeColors = {
  ACADEMIC: {
    number: 'from-blue-600 to-indigo-600',
    description: 'from-blue-50 to-indigo-50 border-blue-100'
  },
  TECHNICAL: {
    number: 'from-green-600 to-emerald-600',
    description: 'from-green-50 to-emerald-50 border-green-100'
  },
  CREATIVE: {
    number: 'from-purple-600 to-violet-600',
    description: 'from-purple-50 to-violet-50 border-purple-100'
  },
  BUSINESS: {
    number: 'from-orange-600 to-amber-600',
    description: 'from-orange-50 to-amber-50 border-orange-100'
  },
  OTHER: {
    number: 'from-gray-600 to-slate-600',
    description: 'from-gray-50 to-slate-50 border-gray-100'
  }
};

export default function ChapterTopicAccordion({ 
  chapterTopic, 
  isOpen = true,
  subjectType = 'OTHER',
  progress,
  completedBlogs = 0,
  totalBlogs = 0,
  blogProgress = [],
  assessments = [],
  readingTime = 0
}: ChapterTopicAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const colors = subjectTypeColors[subjectType];

  return (
    <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left transition-all duration-300 hover:bg-gray-50 focus:outline-none cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Chapter Number */}
            <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r ${colors.number} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {chapterTopic.displayNumber}
            </div>
            
            {/* Chapter Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {chapterTopic.name}
              </h3>
              <div className="flex items-center justify-between space-x-4">
                {readingTime > 0 && (
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>~{readingTime} min</span>
                  </div>
                )}
                {totalBlogs > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {completedBlogs}/{totalBlogs} completed
                    </span>
                    {progress?.status === 'COMPLETED' && (
                      <span className="text-green-600 text-sm font-medium">✓</span>
                    )}
                  </div>
                )}
              </div>
              {totalBlogs > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalBlogs > 0 ? (completedBlogs / totalBlogs) * 100 : 0}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="flex-shrink-0 ml-4">
            <svg
              className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          {/* Chapter Description */}
          <div className={`mt-4 mb-6 p-4 rounded-lg bg-gradient-to-r ${colors.description} border`}>
            <div 
              className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: chapterTopic.description }}
            />
          </div>

          {/* Blog List */}
          {chapterTopic.blogs.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Lessons in this chapter
              </h4>
              
              {chapterTopic.blogs.map((blog, index) => {
                const blogProgressItem = blogProgress.find(bp => bp.blogId === blog.id);
                const isCompleted = blogProgressItem?.status === 'COMPLETED';
                // const assessment = 
                const assessment = assessments?.find(a => a.blogId === blog.id);
                
                return (
                  <div
                    key={blog.id}
                    className={`group block p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Lesson Number */}
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-600 group-hover:bg-green-200'
                          : 'bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/blogs/${blog.slug}?chapter=${chapterTopic.id}`}
                          className="block"
                        >
                          <h5 className={`text-lg font-medium transition-colors ${
                            isCompleted
                              ? 'text-green-900 group-hover:text-green-700'
                              : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {blog.title}
                          </h5>
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                          {blog.publishedAt && (
                            <p className="text-sm text-gray-500">
                              Published: {new Date(blog.publishedAt).toLocaleDateString()}
                            </p>
                          )}
                          {isCompleted && (
                            <span className="text-sm text-green-600 font-medium">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow Icon */}
                      <Link
                        href={`/blogs/${blog.slug}?chapter=${chapterTopic.id}`}
                        className="flex-shrink-0"
                      >
                        <svg 
                          className={`h-5 w-5 transition-colors ${
                            isCompleted
                              ? 'text-green-500 group-hover:text-green-600'
                              : 'text-gray-400 group-hover:text-blue-600'
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    
                    {/* Assessment Status - Full Width */}
                    {assessment && (
                      <div className="mt-4">
                        <AssessmentStatus 
                          assessment={assessment} 
                          blogSlug={blog.slug}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h4>
              <p className="text-gray-600">Lessons for this chapter will be added soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
