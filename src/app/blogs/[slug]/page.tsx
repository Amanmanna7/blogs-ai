'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import BlogPreview from '@/components/BlogPreview';
import Link from 'next/link';
import ScrollToTop from '@/components/ScrollToTop';

interface Category {
  id: string;
  name: string;
}

interface BlogContent {
  id: string;
  name: string;
  textContent: string;
}

interface BlogMedia {
  id: string;
  name: string;
  mediaUrl: string;
  mediaType: string;
}

interface BlogSequence {
  id: string;
  sequence: number;
  type: 'content' | 'media';
  blogContentId?: string;
  blogMediaId?: string;
  blogContent?: BlogContent;
  blogMedia?: BlogMedia;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
  categories: {
    category: Category;
  }[];
  sequences: BlogSequence[];
}

export default function BlogPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapter');
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterLessons, setChapterLessons] = useState<{
    id: string;
    name: string;
    description: string;
    blogs: { id: string; slug: string; title: string; sequence: number; publishedAt: string | null }[];
  } | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blogs/slug/${encodeURIComponent(slug)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog not found');
          } else {
            setError('Failed to load blog');
          }
          return;
        }
        
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Fetch chapter lessons if chapter is present
  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      try {
        const res = await fetch(`/api/chapter-topics/public/${chapterId}`);
        if (!res.ok) return;
        const data = await res.json();
        setChapterLessons(data);
      } catch (e) {
        console.error('Failed to fetch chapter lessons', e);
      }
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog || blog.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Blog not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/blogs"
            className="inline-flex items-center px-4 pt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <ScrollToTop />
      {/* Header - only show back button if not in chapter context */}
      {!chapterId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/blogs"
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back to Blogs
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Blog Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
              <BlogPreview
                title={blog.title}
                tags={blog.tags}
                categories={blog.categories.map(c => c.category)}
                sequences={blog.sequences}
              />
            </div>

            {/* Next Lesson CTA (only when chapter present and lesson exists) */}
            {chapterLessons && (() => {
              const currentIndex = chapterLessons.blogs.findIndex(b => b.slug === slug);
              const next = currentIndex >= 0 ? chapterLessons.blogs[currentIndex + 1] : null;
              return next ? (
                <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-4 sm:p-6 lg:p-8 shadow-xl">
                  {/* Decorative background elements */}
                  <div className="absolute -top-4 -right-4 h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-2 -left-2 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-white/5"></div>
                  
                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                        <p className="text-xs sm:text-sm font-medium text-blue-100">Continue Learning</p>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
                        {next.title}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-blue-100">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" />
                          </svg>
                          Lesson {currentIndex + 2} of {chapterLessons.blogs.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Next up
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/blogs/${next.slug}?chapter=${chapterId}`}
                      className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 sm:px-6 sm:py-3 text-blue-700 font-semibold text-sm sm:text-base hover:bg-blue-50 hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                      
                      <span className="relative z-10">Next Lesson</span>
                      <svg className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Right Column - Blog Information */}
          <div className="space-y-6">
            {/* Blog Details Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Details</h3>
              
              <div className="space-y-4">
                {/* Published Date */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Published</p>
                    <p className="text-sm text-gray-600">{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>

                {/* Updated Date */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">{new Date(blog.updatedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Lessons Sidebar (only when chapter present) */}
            {chapterLessons && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Other lessons in this chapter</h3>
                <div className="space-y-2">
                  {chapterLessons.blogs.map((b, idx) => {
                    const isActive = b.slug === slug;
                    return (
                      <Link
                        key={b.id}
                        href={`/blogs/${b.slug}?chapter=${chapterId}`}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          isActive ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium truncate max-w-[220px]">{b.title}</span>
                        </div>
                        <svg className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Author Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  {blog.author.imageUrl ? (
                    <img 
                      src={blog.author.imageUrl} 
                      alt={blog.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold text-lg">
                      {blog.author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{blog.author.name}</h4>
                  <p className="text-sm text-gray-600">{blog.author.email}</p>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {blog.tags.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Card */}
            {blog.categories.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.categories.map((cat) => (
                    <span
                      key={cat.category.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {cat.category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
