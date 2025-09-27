'use client';

import BlogContentDisplay from './BlogContentDisplay';

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

interface BlogPreviewProps {
  title: string;
  tags: string[];
  categories: Category[];
  sequences: BlogSequence[];
}

export default function BlogPreview({
  title,
  tags,
  categories,
  sequences
}: BlogPreviewProps) {
  const sortedSequences = sequences
    .filter(seq => seq.blogContentId || seq.blogMediaId)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="p-1 lg:p-6">      
      <div className="prose max-w-none">
        {/* Blog Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title || 'Untitled Blog'}
        </h1>
        
        {/* Spacing */}
        <br />
        
        {/* Content and Media Sequences */}
        {sortedSequences.length > 0 ? (
          sortedSequences.map((sequence, index) => (
            <div key={sequence.id}>
              {sequence.blogContentId && (
                <div>
                  <BlogContentDisplay 
                    content={sequence.blogContent?.textContent || ''} 
                  />
                </div>
              )}
              
              {sequence.blogMediaId && sequence.blogMedia && (
                <div>
                  {(() => {
                    const media = sequence.blogMedia;
                    if (!media) return null;
                    
                    switch (media.mediaType) {
                      case 'IMAGE':
                        return (
                          <div className="my-4">
                            <img 
                              src={media.mediaUrl} 
                              alt={media.name}
                              className="max-w-full h-auto rounded-lg shadow-md"
                            />
                            {media.description && (
                              <p className="text-sm text-gray-500 mt-2 italic text-center">
                                {media.description}
                              </p>
                            )}
                          </div>
                        );
                      case 'VIDEO':
                        return (
                          <div className="my-4">
                            <video 
                              src={media.mediaUrl} 
                              controls
                              className="max-w-full h-auto rounded-lg shadow-md"
                            >
                              Your browser does not support the video tag.
                            </video>
                            {media.description && (
                              <p className="text-sm text-gray-500 mt-2 italic text-center">
                                {media.description}
                              </p>
                            )}
                          </div>
                        );
                      case 'AUDIO':
                        return (
                          <div className="my-4">
                            <audio 
                              src={media.mediaUrl} 
                              controls
                              className="w-full"
                            >
                              Your browser does not support the audio tag.
                            </audio>
                            {media.description && (
                              <p className="text-sm text-gray-500 mt-2 italic text-center">
                                {media.description}
                              </p>
                            )}
                          </div>
                        );
                      default:
                        return (
                          <div className="my-4 p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>{media.name}</strong> ({media.mediaType})
                            </p>
                            {media.description && (
                              <p className="text-sm text-gray-500 mt-2 italic text-center">
                                {media.description}
                              </p>
                            )}
                            <a 
                              href={media.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View/Download
                            </a>
                          </div>
                        );
                    }
                  })()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">
            No content or media added yet. Add some content or media to see the preview.
          </div>
        )}
        
        {/* Tags and Categories */}
        {(tags.length > 0 || categories.length > 0) && (
          <>
            <hr className="my-8 border-gray-300" />
            
            <div className="space-y-4">
              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
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
              
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
