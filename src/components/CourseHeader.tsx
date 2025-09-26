'use client';

import Link from 'next/link';

interface CourseHeaderProps {
  course: {
    id: string;
    name: string;
    description: string;
    subjectType: 'ACADEMIC' | 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'OTHER';
    updatedAt: string;
    chapterTopics?: {
      blogs: {
        slug: string;
      }[];
    }[];
  };
}

const subjectTypeColors = {
  ACADEMIC: 'bg-blue-100 text-blue-800 border-blue-200',
  TECHNICAL: 'bg-green-100 text-green-800 border-green-200',
  CREATIVE: 'bg-purple-100 text-purple-800 border-purple-200',
  BUSINESS: 'bg-orange-100 text-orange-800 border-orange-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200'
};

const subjectTypeGradients = {
  ACADEMIC: {
    background: 'from-blue-900 via-blue-800 to-indigo-900',
    overlay: 'from-blue-50/20 via-blue-100/10 to-indigo-50/20',
    bubble1: 'from-blue-200/30 to-blue-300/20',
    bubble2: 'from-indigo-200/30 to-blue-200/20',
    bubble3: 'from-blue-300/20 to-indigo-200/30'
  },
  TECHNICAL: {
    background: 'from-green-900 via-emerald-800 to-teal-900',
    overlay: 'from-green-50/20 via-emerald-100/10 to-teal-50/20',
    bubble1: 'from-green-200/30 to-emerald-300/20',
    bubble2: 'from-teal-200/30 to-green-200/20',
    bubble3: 'from-emerald-300/20 to-teal-200/30'
  },
  CREATIVE: {
    background: 'from-purple-900 via-violet-800 to-fuchsia-900',
    overlay: 'from-purple-50/20 via-violet-100/10 to-fuchsia-50/20',
    bubble1: 'from-purple-200/30 to-violet-300/20',
    bubble2: 'from-fuchsia-200/30 to-purple-200/20',
    bubble3: 'from-violet-300/20 to-fuchsia-200/30'
  },
  BUSINESS: {
    background: 'from-orange-800 via-amber-700 to-yellow-800',
    overlay: 'from-orange-50/30 via-amber-100/20 to-yellow-50/30',
    bubble1: 'from-orange-300/40 to-amber-400/30',
    bubble2: 'from-amber-300/40 to-orange-300/30',
    bubble3: 'from-orange-400/30 to-amber-300/40'
  },
  OTHER: {
    background: 'from-gray-900 via-slate-800 to-zinc-900',
    overlay: 'from-gray-50/20 via-slate-100/10 to-zinc-50/20',
    bubble1: 'from-gray-200/30 to-slate-300/20',
    bubble2: 'from-zinc-200/30 to-gray-200/20',
    bubble3: 'from-slate-300/20 to-zinc-200/30'
  }
};

const subjectTypeLabels = {
  ACADEMIC: 'Academic',
  TECHNICAL: 'Technical',
  CREATIVE: 'Creative',
  BUSINESS: 'Business',
  OTHER: 'Other'
};

export default function CourseHeader({ course }: CourseHeaderProps) {
  // Get the first blog from the first chapter
  const getFirstBlogSlug = () => {
    if (course.chapterTopics && course.chapterTopics.length > 0) {
      const firstChapter = course.chapterTopics[0];
      if (firstChapter.blogs && firstChapter.blogs.length > 0) {
        return firstChapter.blogs[0].slug;
      }
    }
    return null;
  };

  const firstBlogSlug = getFirstBlogSlug();
  const gradients = subjectTypeGradients[course.subjectType];

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-200">
      {/* Dark Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients.background}`}></div>
      
      {/* Overlay Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients.overlay}`}></div>
      
      {/* Decorative Bubbles */}
      <div className={`absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br ${gradients.bubble1} opacity-40`}></div>
      <div className={`absolute top-1/4 -left-6 h-32 w-32 rounded-full bg-gradient-to-br ${gradients.bubble2} opacity-30`}></div>
      <div className={`absolute -bottom-6 right-1/4 h-28 w-28 rounded-full bg-gradient-to-br ${gradients.bubble3} opacity-35`}></div>
      <div className={`absolute top-1/2 left-1/2 h-20 w-20 rounded-full bg-gradient-to-br ${gradients.bubble1} opacity-25`}></div>
      
      {/* Content */}
      <div className="relative p-8">
        {/* Header Row */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl drop-shadow-lg">
              {course.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Subject Type Badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${subjectTypeColors[course.subjectType]}`}>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {subjectTypeLabels[course.subjectType]}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-blue-50 leading-relaxed drop-shadow-sm">
            {course.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {firstBlogSlug ? (
            <Link
              href={`/blogs/${firstBlogSlug}`}
              className="cursor-pointer flex items-center justify-center space-x-2 rounded-lg bg-white px-6 py-3 text-blue-600 font-semibold transition-all duration-200 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z" />
              </svg>
              <span>Start Learning Free</span>
            </Link>
          ) : (
            <button className="cursor-pointer flex items-center justify-center space-x-2 rounded-lg bg-white px-6 py-3 text-blue-600 font-semibold transition-all duration-200 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z" />
              </svg>
              <span>Start Learning Free</span>
            </button>
          )}
          
          <button className="cursor-pointer relative overflow-hidden flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-white font-semibold transition-all duration-500 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 group">
            {/* Premium shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
            
            <svg className="h-5 w-5 relative z-10 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="relative z-10 group-hover:font-bold">Upgrade to AI Premium</span>
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 text-sm text-blue-100">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center border border-green-400/30">
              <svg className="h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Free Course Content</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-blue-100">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/30">
              <svg className="h-4 w-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>AI Chat Support</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-blue-100">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 backdrop-blur-sm flex items-center justify-center border border-purple-400/30">
              <svg className="h-4 w-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Instant Doubt Resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
