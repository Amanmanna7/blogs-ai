'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/CourseCard';
import ScrollToTop from '@/components/ScrollToTop';

interface Course {
  id: string;
  name: string;
  description: string;
  subjectType: 'ACADEMIC' | 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'OTHER';
  chapterTopicCount: number;
  createdAt: string;
  latestCompletedBlogTime: string | null;
  progress?: {
    completedBlogs: number;
    totalBlogs: number;
    progressPercentage: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: Course[];
  error?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>('ALL');
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses/public');
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setCourses(data.data);
        } else {
          setError(data.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError('Failed to fetch courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Categorize courses
  const categorizeCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject type
    if (selectedSubjectType !== 'ALL') {
      filtered = filtered.filter(course => course.subjectType === selectedSubjectType);
    }

    const inProgress = filtered.filter(course => 
      course.progress && 
      course.progress.completedBlogs > 0 && 
      course.progress.completedBlogs < course.progress.totalBlogs
    ).sort((a, b) => {
      if (a.latestCompletedBlogTime && b.latestCompletedBlogTime) {
        return new Date(b.latestCompletedBlogTime).getTime() - new Date(a.latestCompletedBlogTime).getTime();
      }
      return 0;
    });

    const notStarted = filtered.filter(course => 
      !course.progress || course.progress.completedBlogs === 0
    ).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const completed = filtered.filter(course => 
      course.progress && 
      course.progress.completedBlogs === course.progress.totalBlogs &&
      course.progress.totalBlogs > 0
    ).sort((a, b) => {
      if (a.latestCompletedBlogTime && b.latestCompletedBlogTime) {
        return new Date(b.latestCompletedBlogTime).getTime() - new Date(a.latestCompletedBlogTime).getTime();
      }
      return 0;
    });

    return { inProgress, notStarted, completed };
  };

  const { inProgress, notStarted, completed } = categorizeCourses();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 p-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Courses</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderCourseSection = (title: string, courses: Course[], showAll: boolean, setShowAll: (show: boolean) => void, maxVisible: number = 3) => {
    const visibleCourses = showAll ? courses : courses.slice(0, maxVisible);
    const hasMore = courses.length > maxVisible;

    if (courses.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
        
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
            >
              <span>{showAll ? 'Show Less' : `View All ${courses.length} Courses`}</span>
              <svg 
                className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ScrollToTop />
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-8 -right-8 h-96 w-96 rounded-full bg-white/5"></div>
            <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-20 text-center">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
              My Learning
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
              Track your progress, continue learning, and discover new courses to advance your skills.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Track Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Continue Learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Discover New Courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Subject Type Filter */}
                <div className="relative">
                  <select
                    value={selectedSubjectType}
                    onChange={(e) => setSelectedSubjectType(e.target.value)}
                    className={`w-full appearance-none rounded-lg border py-3 pl-4 pr-12 text-gray-900 focus:outline-none focus:ring-2 ${
                      selectedSubjectType === 'ACADEMIC' ? 'border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-blue-200' :
                      selectedSubjectType === 'TECHNICAL' ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200' :
                      selectedSubjectType === 'CREATIVE' ? 'border-purple-300 bg-purple-50 focus:border-purple-500 focus:ring-purple-200' :
                      selectedSubjectType === 'BUSINESS' ? 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200' :
                      selectedSubjectType === 'OTHER' ? 'border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-200' :
                      'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  >
                    <option value="ALL">All Subjects</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="CREATIVE">Creative</option>
                    <option value="BUSINESS">Business</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || selectedSubjectType !== 'ALL') && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedSubjectType !== 'ALL' && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      Subject: {selectedSubjectType}
                      <button
                        onClick={() => setSelectedSubjectType('ALL')}
                        className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-green-200 text-green-600 hover:bg-green-300 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses Sections */}
        <div className="container mx-auto px-4 pb-16">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gray-100 p-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">No Courses Available</h3>
              <p className="text-gray-600">Check back later for new course offerings.</p>
            </div>
          ) : (
            <>
              {/* In Progress Courses */}
              {renderCourseSection(
                "Continue Learning",
                inProgress,
                showAllInProgress,
                setShowAllInProgress
              )}

              {/* Not Started Courses */}
              {renderCourseSection(
                "Not Started",
                notStarted,
                false,
                () => {},
                notStarted.length // Show all not started courses
              )}

              {/* Completed Courses */}
              {renderCourseSection(
                "Completed",
                completed,
                showAllCompleted,
                setShowAllCompleted
              )}

              {/* No results message */}
              {inProgress.length === 0 && notStarted.length === 0 && completed.length === 0 && (
                <div className="text-center py-20">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gray-100 p-6">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">No Courses Found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSubjectType('ALL');
                    }}
                    className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        {courses.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Ready to Start Learning?
              </h2>
              <p className="mb-8 text-xl text-blue-100">
                Access free course content with premium AI-powered doubt resolution
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="cursor-pointer rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:shadow-lg">
                  Start Learning Free
                </button>
                <button className="cursor-pointer rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg">
                  Upgrade to AI Premium
                </button>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Free Course Content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>AI Chat Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Instant Doubt Resolution</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }
