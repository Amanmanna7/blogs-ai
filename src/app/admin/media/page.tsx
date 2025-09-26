'use client';

import { useState } from 'react';
import BlogMediaForm from '@/components/BlogMediaForm';
import BlogMediaTable from '@/components/BlogMediaTable';
import { Plus, X } from 'lucide-react';

interface BlogMedia {
  id: string;
  name: string;
  slug: string;
  mediaType: string;
  mediaUrl: string;
  description?: string;
  createdAt: string;
  meta?: any;
}

export default function MediaManagementPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState<BlogMedia | null>(null);
  const [viewingMedia, setViewingMedia] = useState<BlogMedia | null>(null);

  const handleUploadSuccess = (media: BlogMedia) => {
    setShowUploadForm(false);
    setEditingMedia(null);
    // The table will refresh automatically
  };

  const handleEdit = (media: BlogMedia) => {
    setEditingMedia(media);
    setShowUploadForm(true);
  };

  const handleView = (media: BlogMedia) => {
    setViewingMedia(media);
  };

  const handleDelete = (media: BlogMedia) => {
    // The table will refresh automatically
    console.log('Media deleted:', media.name);
  };

  const handleCancel = () => {
    setShowUploadForm(false);
    setEditingMedia(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
              <p className="mt-2 text-gray-600">
                Upload and manage your blog media files
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload Media
            </button>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <BlogMediaForm
                onSuccess={handleUploadSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Media Viewer Modal */}
        {viewingMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{viewingMedia.name}</h2>
                  <button
                    onClick={() => setViewingMedia(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media Type
                    </label>
                    <p className="text-sm text-gray-900 capitalize">{viewingMedia.mediaType}</p>
                  </div>
                  
                  {viewingMedia.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <p className="text-sm text-gray-900">{viewingMedia.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={viewingMedia.mediaUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(viewingMedia.mediaUrl)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview
                    </label>
                    <div className="border border-gray-300 rounded-md p-4">
                      {viewingMedia.mediaType === 'IMAGE' ? (
                        <img
                          src={viewingMedia.mediaUrl}
                          alt={viewingMedia.name}
                          className="max-w-full max-h-96 object-contain mx-auto"
                        />
                      ) : viewingMedia.mediaType === 'VIDEO' ? (
                        <video
                          src={viewingMedia.mediaUrl}
                          controls
                          className="max-w-full max-h-96 mx-auto"
                        />
                      ) : viewingMedia.mediaType === 'AUDIO' ? (
                        <audio
                          src={viewingMedia.mediaUrl}
                          controls
                          className="w-full"
                        />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Preview not available for this file type</p>
                          <a
                            href={viewingMedia.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Open File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Table */}
        <BlogMediaTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
    </div>
  );
}
