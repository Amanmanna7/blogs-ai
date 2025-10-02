'use client';

import Link from 'next/link';

interface AssessmentStatusProps {
  assessment: {
    id: string;
    status: string;
    title: string | null;
    totalQuestions: number;
    createdAt: string;
    updatedAt: string;
  };
  blogSlug: string;
}

export default function AssessmentStatus({ assessment, blogSlug }: AssessmentStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'ACTIVE':
        return 'Available';
      case 'DRAFT':
        return 'Draft';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'View Results';
      case 'ACTIVE':
        return 'Take Quiz';
      case 'DRAFT':
        return 'Preview';
      default:
        return 'View';
    }
  };

  const getButtonHref = (status: string, blogSlug: string) => {
    switch (status) {
      case 'COMPLETED':
        return `/blogs/${blogSlug}/assessment/results`;
      case 'ACTIVE':
      case 'DRAFT':
        return `/blogs/${blogSlug}/assessment`;
      default:
        return `/blogs/${blogSlug}/assessment`;
    }
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
      assessment.status === 'COMPLETED'
        ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-green-200/30'
        : 'bg-white border border-gray-200'
    }`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-gray-900">Quiz</h4>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(assessment.status)}`}>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
          </svg>
          {getStatusText(assessment.status)}
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Assessment Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-sm text-gray-600">
              {assessment.totalQuestions} questions
            </span>
            {assessment.title && (
              <>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span className="text-sm text-gray-700 font-medium truncate" title={assessment.title}>
                  {assessment.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={getButtonHref(assessment.status, blogSlug)}
            className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              assessment.status === 'COMPLETED'
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                : assessment.status === 'ACTIVE'
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {assessment.status === 'COMPLETED' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              )}
            </svg>
            {getButtonText(assessment.status)}
          </Link>
        </div>
      </div>
    </div>
  );
}
