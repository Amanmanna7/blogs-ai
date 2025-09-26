'use client';

import { useState } from 'react';
import { MediaType } from '@prisma/client';
import { Upload, X, FileImage, FileVideo, FileAudio, FileText, File } from 'lucide-react';

interface BlogMediaFormProps {
  onSuccess?: (media: any) => void;
  onCancel?: () => void;
}

const mediaTypeIcons = {
  [MediaType.IMAGE]: FileImage,
  [MediaType.VIDEO]: FileVideo,
  [MediaType.AUDIO]: FileAudio,
  [MediaType.DOCUMENT]: FileText,
  [MediaType.OTHER]: File,
};

const mediaTypeLabels = {
  [MediaType.IMAGE]: 'Image',
  [MediaType.VIDEO]: 'Video',
  [MediaType.AUDIO]: 'Audio',
  [MediaType.DOCUMENT]: 'Document',
  [MediaType.OTHER]: 'Other',
};

// File type restrictions for each media type
const mediaTypeFileTypes = {
  [MediaType.IMAGE]: {
    accept: 'image/*',
    types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    description: 'Images (JPEG, PNG, GIF, WebP, SVG)'
  },
  [MediaType.VIDEO]: {
    accept: 'video/*',
    types: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'],
    description: 'Videos (MP4, WebM, OGG, AVI, MOV, WMV)'
  },
  [MediaType.AUDIO]: {
    accept: 'audio/*',
    types: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'],
    description: 'Audio (MP3, WAV, OGG, M4A, AAC, FLAC)'
  },
  [MediaType.DOCUMENT]: {
    accept: '.pdf,.doc,.docx,.txt,.rtf,.odt',
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text'],
    description: 'Documents (PDF, DOC, DOCX, TXT, RTF, ODT)'
  },
  [MediaType.OTHER]: {
    accept: '*/*',
    types: [],
    description: 'Any file type'
  }
};

export default function BlogMediaForm({ onSuccess, onCancel }: BlogMediaFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    mediaType: MediaType.IMAGE,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validateFileType = (file: File, mediaType: MediaType): boolean => {
    const allowedTypes = mediaTypeFileTypes[mediaType].types;
    
    // If no specific types are defined (like for OTHER), allow all
    if (allowedTypes.length === 0) {
      return true;
    }
    
    return allowedTypes.includes(file.type);
  };

  const handleFileChange = (selectedFile: File) => {
    setError(null);
    
    // Check if file type matches the selected media type
    if (!validateFileType(selectedFile, formData.mediaType)) {
      const allowedTypes = mediaTypeFileTypes[formData.mediaType];
      setError(`Invalid file type. Please select a ${allowedTypes.description} file.`);
      return;
    }
    
    setFile(selectedFile);

    // Auto-fill name if empty
    if (!formData.name) {
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
      const generatedSlug = generateSlug(nameWithoutExtension);
      setFormData(prev => ({ 
        ...prev, 
        name: nameWithoutExtension,
        slug: generatedSlug
      }));
    }
  };

  const handleNameChange = (name: string) => {
    const generatedSlug = generateSlug(name);
    setFormData(prev => ({ 
      ...prev, 
      name,
      slug: generatedSlug
    }));
  };

  const handleMediaTypeChange = (newMediaType: MediaType) => {
    setFormData(prev => ({ ...prev, mediaType: newMediaType }));
    
    // Clear file if it doesn't match the new media type
    if (file && !validateFileType(file, newMediaType)) {
      setFile(null);
      setError(`Please select a file that matches the ${mediaTypeLabels[newMediaType]} type.`);
    } else {
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Please enter a slug');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('name', formData.name);
      uploadData.append('slug', formData.slug);
      uploadData.append('description', formData.description);
      uploadData.append('mediaType', formData.mediaType);

      const response = await fetch('/api/blog-media', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const media = await response.json();
      onSuccess?.(media);
      
      // Reset form
      setFormData({ name: '', slug: '', description: '', mediaType: MediaType.IMAGE });
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Media</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {(() => {
                  const IconComponent = mediaTypeIcons[formData.mediaType];
                  return <IconComponent className="w-12 h-12 text-green-500" />;
                })()}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your {mediaTypeLabels[formData.mediaType].toLowerCase()} here, or{' '}
                  <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      accept={mediaTypeFileTypes[formData.mediaType].accept}
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  {mediaTypeFileTypes[formData.mediaType].description} (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter media name"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter media slug (auto-generated from name)"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the name (auto-generated)
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter media description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <select
              id="mediaType"
              value={formData.mediaType}
              onChange={(e) => handleMediaTypeChange(e.target.value as MediaType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(MediaType).map((type) => (
                <option key={type} value={type}>
                  {mediaTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!file || !formData.name.trim() || !formData.slug.trim() || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
