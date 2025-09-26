'use client';

import { useState } from 'react';

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
  description?: string;
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

interface BlogSequenceItemProps {
  sequence: BlogSequence;
  index: number;
  blogContents: BlogContent[];
  blogMedia: BlogMedia[];
  onUpdate: (id: string, updates: Partial<BlogSequence>) => void;
  onRemove: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  disabled?: boolean;
}

export default function BlogSequenceItem({
  sequence,
  index,
  blogContents,
  blogMedia,
  onUpdate,
  onRemove,
  onMove,
  disabled = false
}: BlogSequenceItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({ index, sequenceId: sequence.id }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    try {
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
      if (!isNaN(dragIndex) && dragIndex !== index) {
        console.log('Moving sequence from', dragIndex, 'to', index);
        onMove(dragIndex, index);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleContentChange = (blogContentId: string) => {
    onUpdate(sequence.id, { blogContentId, type: 'content' });
  };

  const handleMediaChange = (blogMediaId: string) => {
    onUpdate(sequence.id, { blogMediaId, type: 'media' });
  };

  // Use the sequence type directly, don't infer from IDs
  const actualType = sequence.type;

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 shadow-lg transform rotate-2 scale-105' 
          : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:bg-gray-50'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {sequence.sequence}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {actualType === 'content' ? 'Content' : 'Media'}
          </span>
        </div>
        {!disabled && (
          <div className="flex items-center space-x-2">
            <div className="text-gray-400 text-xs">
              Drag to reorder
            </div>
            <div className="text-gray-400">
              ⋮⋮
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => onRemove(sequence.id)}
          className="text-red-500 hover:text-red-700 text-sm"
          disabled={disabled}
        >
          Remove
        </button>
      </div>

      {actualType === 'content' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Content
          </label>
          <select
            value={sequence.blogContentId || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          >
            <option value="">Choose content...</option>
            {blogContents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.name}
              </option>
            ))}
          </select>
          {sequence.blogContentId && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
              {blogContents.find(c => c.id === sequence.blogContentId)?.name}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Media
          </label>
          <select
            value={sequence.blogMediaId || ''}
            onChange={(e) => handleMediaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          >
            <option value="">Choose media...</option>
            {blogMedia.map((media) => (
              <option key={media.id} value={media.id}>
                {media.name} ({media.mediaType})
              </option>
            ))}
          </select>
          {sequence.blogMediaId && (
            <div className="mt-2">
              {(() => {
                const selectedMedia = blogMedia.find(m => m.id === sequence.blogMediaId);
                if (!selectedMedia) return null;
                
                return (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{selectedMedia.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {selectedMedia.mediaType}
                      </span>
                    </div>
                    
                    {/* Media Preview */}
                    <div className="mt-3">
                      {selectedMedia.mediaType === 'IMAGE' ? (
                        <img
                          src={selectedMedia.mediaUrl}
                          alt={selectedMedia.name}
                          className="max-w-full max-h-48 object-contain rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : selectedMedia.mediaType === 'VIDEO' ? (
                        <video
                          src={selectedMedia.mediaUrl}
                          controls
                          className="max-w-full max-h-48 rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : selectedMedia.mediaType === 'AUDIO' ? (
                        <audio
                          src={selectedMedia.mediaUrl}
                          controls
                          className="w-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center p-8 bg-gray-50 rounded border">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">{selectedMedia.mediaType} File</p>
                            <a
                              href={selectedMedia.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                            >
                              View File
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {/* Fallback for failed media */}
                      <div className="hidden items-center justify-center p-8 bg-gray-50 rounded border">
                        <div className="text-center">
                          <div className="text-4xl mb-2">⚠️</div>
                          <p className="text-sm text-gray-600">Media preview unavailable</p>
                          <a
                            href={selectedMedia.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {/* Media Description */}
                    {selectedMedia.description && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-500 italic">
                          {selectedMedia.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Media URL */}
                    <div className="mt-2 text-xs text-gray-500 break-all">
                      {selectedMedia.mediaUrl}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
