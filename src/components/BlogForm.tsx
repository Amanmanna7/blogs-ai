'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import BlogPreview from './BlogPreview';
import BlogSequenceItem from './BlogSequenceItem';

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

interface BlogFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    categories: Category[];
    sequences: BlogSequence[];
  };
  isEditing?: boolean;
}

export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(
    initialData?.status || 'DRAFT'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const initialCategoryIds = initialData?.categories?.map(c => c.id) || [];
    return initialCategoryIds;
  });
  const [sequences, setSequences] = useState<BlogSequence[]>(
    initialData?.sequences || []
  );
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogContents, setBlogContents] = useState<BlogContent[]>([]);
  const [blogMedia, setBlogMedia] = useState<BlogMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(50); // Percentage

  const router = useRouter();
  const { user } = useRole();

  useEffect(() => {
    fetchData();
  }, []);

  // Populate sequences with full data when editing
  useEffect(() => {
    if (isEditing && initialData?.sequences && blogContents.length > 0 && blogMedia.length > 0) {
      
      const populatedSequences = initialData.sequences.map(seq => {
        const populatedSeq = { ...seq };
        
        // Populate blogContent if it exists
        if (seq.blogContentId) {
          const content = blogContents.find(c => c.id === seq.blogContentId);
          if (content) {
            populatedSeq.blogContent = content;
            populatedSeq.type = 'content'; // Ensure type is set correctly
          }
        }
        
        // Populate blogMedia if it exists
        if (seq.blogMediaId) {
          const media = blogMedia.find(m => m.id === seq.blogMediaId);
          if (media) {
            populatedSeq.blogMedia = media;
            populatedSeq.type = 'media'; // Ensure type is set correctly
          }
        }
        
        return populatedSeq;
      });
      
      setSequences(populatedSequences);
    }
  }, [isEditing, initialData?.sequences, blogContents, blogMedia]);

  // Ensure selected categories are properly set when editing
  useEffect(() => {
    
    
    if (isEditing && initialData?.categories && categories.length > 0) {
      const categoryIds = initialData.categories.map(c => c.id);
      setSelectedCategories(categoryIds);
    }
  }, [isEditing, initialData?.categories, categories]);

  const fetchData = async () => {
    try {
      const [categoriesRes, contentsRes, mediaRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/blog-content'),
        fetch('/api/blog-media')
      ]);

      const [categoriesData, contentsData, mediaData] = await Promise.all([
        categoriesRes.json(),
        contentsRes.json(),
        mediaRes.json()
      ]);
      
      setCategories(categoriesData.categories || []);
      setBlogContents(contentsData.blogContents || []);
      setBlogMedia(mediaData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing || slug === generateSlug(initialData?.title || '')) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addContentSequence = () => {
    const nextSequence = Math.max(...sequences.map(s => s.sequence), 0) + 1;
    const newSequence: BlogSequence = {
      id: `temp-${Date.now()}`,
      sequence: nextSequence,
      type: 'content',
      blogContentId: undefined
    };
    setSequences([...sequences, newSequence]);
  };

  const addMediaSequence = () => {
    const nextSequence = Math.max(...sequences.map(s => s.sequence), 0) + 1;
    const newSequence: BlogSequence = {
      id: `temp-${Date.now()}`,
      sequence: nextSequence,
      type: 'media',
      blogMediaId: undefined
    };
    setSequences([...sequences, newSequence]);
  };

  const updateSequence = (id: string, updates: Partial<BlogSequence>) => {
    
    setSequences(sequences.map(seq => {
      if (seq.id === id) {
        const updatedSeq = { ...seq, ...updates };
        
        // Clear the opposite type's data when switching types
        if (updates.type === 'content') {
          updatedSeq.blogMediaId = undefined;
          updatedSeq.blogMedia = undefined;
        } else if (updates.type === 'media') {
          updatedSeq.blogContentId = undefined;
          updatedSeq.blogContent = undefined;
        }
        
        // If content is selected, populate the blogContent data
        if (updates.blogContentId && updates.type === 'content') {
          const selectedContent = blogContents.find(c => c.id === updates.blogContentId);
          if (selectedContent) {
            updatedSeq.blogContent = selectedContent;
          }
        }
        
        // If media is selected, populate the blogMedia data
        if (updates.blogMediaId && updates.type === 'media') {
          const selectedMedia = blogMedia.find(m => m.id === updates.blogMediaId);
          if (selectedMedia) {
            updatedSeq.blogMedia = selectedMedia;
          }
        }
        
        return updatedSeq;
      }
      return seq;
    }));
  };

  const removeSequence = (id: string) => {
    const newSequences = sequences.filter(seq => seq.id !== id);
    // Reorder sequences
    const reorderedSequences = newSequences
      .sort((a, b) => a.sequence - b.sequence)
      .map((seq, index) => ({ ...seq, sequence: index + 1 }));
    setSequences(reorderedSequences);
  };

  const moveSequence = (dragIndex: number, hoverIndex: number) => {
    
    if (dragIndex === hoverIndex) {
      return;
    }
    
    if (dragIndex < 0 || dragIndex >= sequences.length || hoverIndex < 0 || hoverIndex >= sequences.length) {
      console.error('Invalid drag indices:', { dragIndex, hoverIndex, length: sequences.length });
      return;
    }
    
    const draggedSequence = sequences[dragIndex];
    const newSequences = [...sequences];
    newSequences.splice(dragIndex, 1);
    newSequences.splice(hoverIndex, 0, draggedSequence);
    
    // Update sequence numbers
    const reorderedSequences = newSequences.map((seq, index) => ({
      ...seq,
      sequence: index + 1
    }));
    
    setSequences(reorderedSequences);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing ? `/api/blogs/${initialData?.id}` : '/api/blogs';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          tags,
          status,
          authorId: user?.id,
          categoryIds: selectedCategories,
          sequences: sequences.map(seq => ({
            sequence: seq.sequence,
            type: seq.type,
            blogContentId: seq.blogContentId,
            blogMediaId: seq.blogMediaId
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blog');
      }

      const result = await response.json();
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to save blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while sequences are being populated in edit mode
  if (isEditing && initialData?.sequences && sequences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog sequences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Form Section */}
        <div 
          className="bg-white shadow-lg overflow-y-auto"
          style={{ width: `${100 - previewWidth}%` }}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Edit Blog' : 'Create New Blog'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter blog title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="blog-slug"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add tags (press Enter to add)"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Blog Sequences */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Content Sequence
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={addContentSequence}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      + Add Content
                    </button>
                    <button
                      type="button"
                      onClick={addMediaSequence}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      disabled={isSubmitting}
                    >
                      + Add Media
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {sequences
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((sequence, index) => {
                      return (
                        <BlogSequenceItem
                          key={sequence.id}
                          sequence={sequence}
                          index={index}
                          blogContents={blogContents}
                          blogMedia={blogMedia}
                          onUpdate={updateSequence}
                          onRemove={removeSequence}
                          onMove={moveSequence}
                          disabled={isSubmitting}
                        />
                      );
                    })}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !slug.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/blogs')}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = previewWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const newWidth = Math.max(20, Math.min(80, startWidth - (deltaX / window.innerWidth) * 100));
              setPreviewWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="w-1 h-8 bg-gray-500 rounded"></div>
        </div>

        {/* Preview Section */}
        <div 
          className="bg-gray-100 overflow-y-auto"
          style={{ width: `${previewWidth}%` }}
        >
          
          <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preview
          </h2>
          <BlogPreview
            title={title}
            tags={tags}
            categories={categories.filter(c => selectedCategories.includes(c.id))}
            sequences={sequences}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
