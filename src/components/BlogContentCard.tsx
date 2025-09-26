'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/styles/blog-content.css';

interface BlogContent {
  id: string;
  textContent: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
}

interface BlogContentCardProps {
  content: BlogContent;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export default function BlogContentCard({ content, onDelete, canEdit }: BlogContentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Strip HTML tags for preview
  const getPreview = (html: string, maxLength: number = 150) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Format date and time separately
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(content.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {content.createdBy.imageUrl ? (
              <img
                className="h-10 w-10 rounded-full flex-shrink-0"
                src={content.createdBy.imageUrl}
                alt={content.createdBy.name || 'User'}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">
                  {content.createdBy.name?.charAt(0) || content.createdBy.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {content.createdBy.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 truncate">{content.createdBy.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs font-medium text-gray-900">
                {formatDate(content.updatedAt)}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(content.updatedAt)}
              </div>
            </div>
            {content.createdAt !== content.updatedAt && (
              <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                Edited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="px-6 py-6">
        <div className="blog-content text-sm">
          <div
            className="text-gray-700 line-clamp-4"
            dangerouslySetInnerHTML={{
              __html: content.textContent
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href={`/admin/blog-contents/${content.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
            >
              View Full Content
            </Link>
            {canEdit && (
              <Link
                href={`/admin/blog-contents/${content.id}/edit`}
                className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors duration-150"
              >
                Edit
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {canEdit && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
