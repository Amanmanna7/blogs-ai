'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  subjectType = 'OTHER'
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
              <p className="text-gray-600 text-sm">
                {chapterTopic.blogs.length} lesson{chapterTopic.blogs.length !== 1 ? 's' : ''}
              </p>
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
            <p className="text-gray-700 leading-relaxed">
              {chapterTopic.description}
            </p>
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
              
              {chapterTopic.blogs.map((blog, index) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}?chapter=${chapterTopic.id}`}
                  className="group block p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    {/* Lesson Number */}
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                      {index + 1}
                    </div>
                    
                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {blog.title}
                      </h5>
                      {blog.publishedAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Published: {new Date(blog.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg 
                        className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
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
