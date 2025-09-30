'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CourseHeader from '@/components/CourseHeader';
import ChapterTopicAccordion from '@/components/ChapterTopicAccordion';
import ScrollToTop from '@/components/ScrollToTop';

interface Course {
  id: string;
  name: string;
  description: string;
  subjectType: 'ACADEMIC' | 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'OTHER';
  updatedAt: string;
  chapterTopics: {
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
  }[];
  progress?: {
    completedBlogs: number;
    totalBlogs: number;
    progressPercentage: number;
    chapters: Array<{
      id: string;
      name: string;
      sequenceNumber: number;
      progress?: {
        status: string;
        completedAt?: Date;
      } | null;
      completedBlogs: number;
      totalBlogs: number;
      blogProgress: Array<{
        blogId: string;
        status: string;
        completedAt?: Date;
      }>;
    }>;
  };
}

interface ApiResponse {
  success: boolean;
  data: Course;
  error?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          // Fetch progress data
          try {
            const progressResponse = await fetch(`/api/progress?courseId=${courseId}`);
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              if (progressData.success) {
                setCourse({
                  ...data.data,
                  progress: {
                    completedBlogs: progressData.data.completedBlogs,
                    totalBlogs: progressData.data.totalBlogs,
                    progressPercentage: progressData.data.progressPercentage,
                    chapters: progressData.data.chapters
                  }
                });
                return;
              }
            }
          } catch (progressError) {
            console.error('Failed to fetch progress:', progressError);
          }
          
          setCourse(data.data);
        } else {
          setError(data.error || 'Failed to fetch course');
        }
      } catch (err) {
        setError('Failed to fetch course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
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
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Course</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Course Not Found</h2>
            <p className="text-gray-600">The course you're looking for doesn't exist or is no longer available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ScrollToTop />
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-12">
          <CourseHeader course={course} />
        </div>


        {/* Chapter Topics Section */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chapters
            </h2>
            <p className="text-lg text-gray-600">
              Explore the structured learning path with {course.chapterTopics.length} chapter{course.chapterTopics.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Chapter Topics Accordions */}
          {course.chapterTopics.length > 0 ? (
            <div className="space-y-6">
              {course.chapterTopics.map((chapterTopic, index) => (
                <div
                  key={chapterTopic.id}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <ChapterTopicAccordion 
                    chapterTopic={chapterTopic} 
                    isOpen={true} // All accordions open by default
                    subjectType={course.subjectType}
                    progress={course.progress?.chapters.find(c => c.id === chapterTopic.id)?.progress}
                    completedBlogs={course.progress?.chapters.find(c => c.id === chapterTopic.id)?.completedBlogs || 0}
                    totalBlogs={course.progress?.chapters.find(c => c.id === chapterTopic.id)?.totalBlogs || 0}
                    blogProgress={course.progress?.chapters.find(c => c.id === chapterTopic.id)?.blogProgress || []}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gray-100 p-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">No Chapters Available</h3>
              <p className="text-gray-600">Course chapters will be added soon.</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className={`mt-16 rounded-2xl p-8 text-center backdrop-blur-md border ${
          course.subjectType === 'ACADEMIC' ? 'bg-blue-500/10 border-blue-200/30' :
          course.subjectType === 'TECHNICAL' ? 'bg-green-500/10 border-green-200/30' :
          course.subjectType === 'CREATIVE' ? 'bg-purple-500/10 border-purple-200/30' :
          course.subjectType === 'BUSINESS' ? 'bg-orange-500/10 border-orange-200/30' :
          'bg-gray-500/10 border-gray-200/30'
        }`}>
          <h3 className="mb-4 text-2xl font-bold text-gray-800">
            Ready to Start Learning?
          </h3>
          <p className="mb-6 text-gray-600">
            Access all course content for free with premium AI support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="cursor-pointer rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:shadow-lg">
              Start Learning Free
            </button>
            <button className="cursor-pointer rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg">
              Upgrade to AI Premium
            </button>
          </div>
        </div>
      </div>

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
