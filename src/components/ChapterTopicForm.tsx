'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Course, Blog } from '@prisma/client';
import { Plus, X, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { Emoji } from '@tiptap/extension-emoji';
import { createLowlight } from 'lowlight';
import EmojiPicker from 'emoji-picker-react';
import '@/styles/tiptap.css';

// Import common programming languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';

// Create lowlight instance with all languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('csharp', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('kotlin', kotlin);
lowlight.register('sql', sql);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('json', json);
lowlight.register('yaml', yaml);
lowlight.register('bash', bash);
lowlight.register('markdown', markdown);

interface ChapterTopicFormProps {
  initialData?: {
    id: string;
    courseId: string;
    sequenceNumber: number;
    name: string;
    description: string;
    blogRelations: Array<{
      id: string;
      blogId: string;
      sequence: number;
      blog: Blog;
    }>;
  };
  isEditing?: boolean;
  courseId?: string;
}

interface CourseWithChapters extends Course {
  chapterTopics: Array<{
    id: string;
    name: string;
    description: string;
    sequenceNumber: number;
    blogRelations?: Array<{
      id: string;
      blogId: string;
      sequence: number;
      blog: Blog;
    }>;
  }>;
}

interface BlogSequence {
  id: string;
  sequence: number;
  blogId: string;
  blog: Blog;
}

export default function ChapterTopicForm({ 
  initialData, 
  isEditing = false, 
  courseId 
}: ChapterTopicFormProps) {
  const [formData, setFormData] = useState({
    courseId: initialData?.courseId || courseId || '',
    sequenceNumber: initialData?.sequenceNumber || 1,
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  // TipTap editor for description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: element => element.style.fontSize,
              renderHTML: attributes => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
            fontFamily: {
              default: null,
              parseHTML: element => element.style.fontFamily,
              renderHTML: attributes => {
                if (!attributes.fontFamily) {
                  return {};
                }
                return {
                  style: `font-family: ${attributes.fontFamily}`,
                };
              },
            },
          };
        },
      }),
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto font-mono text-sm',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule,
      Subscript,
      Superscript,
      Underline,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Emoji.configure({
        enableEmoticons: true,
        suggestion: {
          items: ({ query }) => {
            return [
              '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
              '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
              '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
              '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
              '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
              '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
              '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
              '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
              '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
              '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
              '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
            ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
          },
        },
      }),
    ],
    content: formData.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        description: html
      }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3',
      },
    },
  });

  // Update editor content when formData.description changes
  useEffect(() => {
    if (descriptionEditor && formData.description !== descriptionEditor.getHTML()) {
      descriptionEditor.commands.setContent(formData.description);
    }
  }, [formData.description, descriptionEditor]);

  // MenuBar component for TipTap editor
  function MenuBar({ editor }: { editor: any }) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const editorState = useEditorState({
      editor,
      selector: (ctx: any) => {
        return {
          isBold: ctx.editor.isActive('bold') ?? false,
          canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
          isItalic: ctx.editor.isActive('italic') ?? false,
          canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
          isUnderline: ctx.editor.isActive('underline') ?? false,
          canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
          isStrike: ctx.editor.isActive('strike') ?? false,
          canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
          isCode: ctx.editor.isActive('code') ?? false,
          canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
          isParagraph: ctx.editor.isActive('paragraph') ?? false,
          isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
          isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
          isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
          isBulletList: ctx.editor.isActive('bulletList') ?? false,
          isOrderedList: ctx.editor.isActive('orderedList') ?? false,
          isBlockquote: ctx.editor.isActive('blockquote') ?? false,
          canUndo: ctx.editor.can().chain().undo().run() ?? false,
          canRedo: ctx.editor.can().chain().redo().run() ?? false,
          isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
          isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
          isAlignRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
          currentColor: ctx.editor.getAttributes('textStyle').color || '',
        }
      },
    });

    return (
      <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1 relative">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isBold ? 'bg-gray-300' : ''
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isItalic ? 'bg-gray-300' : ''
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canUnderline}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isUnderline ? 'bg-gray-300' : ''
          }`}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isStrike ? 'bg-gray-300' : ''
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isCode ? 'bg-gray-300' : ''
          }`}
          title="Inline Code"
        >
          {'</>'}
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isParagraph ? 'bg-gray-300' : ''
          }`}
          title="Paragraph"
        >
          P
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isHeading1 ? 'bg-gray-300' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isHeading2 ? 'bg-gray-300' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isHeading3 ? 'bg-gray-300' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isBulletList ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isOrderedList ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isBlockquote ? 'bg-gray-300' : ''
          }`}
          title="Quote"
        >
          "
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isAlignLeft ? 'bg-gray-300' : ''
          }`}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isAlignCenter ? 'bg-gray-300' : ''
          }`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editorState.isAlignRight ? 'bg-gray-300' : ''
          }`}
          title="Align Right"
        >
          ➡
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200"
          title="Undo"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200"
          title="Redo"
        >
          ↷
        </button>
        
        {/* Color picker */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          value={editorState.currentColor || '#000000'}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />
        
        {/* Emoji picker */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200"
          title="Emoji"
        >
          😀
        </button>
        
        {showEmojiPicker && (
          <div className="absolute top-full left-0 z-50 mt-1">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                editor.chain().focus().insertContent(emojiData.emoji).run();
                setShowEmojiPicker(false);
              }}
              width={300}
              height={400}
            />
          </div>
        )}
      </div>
    );
  }
  
  const [blogSequences, setBlogSequences] = useState<BlogSequence[]>(
    initialData?.blogRelations?.map(rel => ({
      id: rel.id,
      sequence: rel.sequence,
      blogId: rel.blogId,
      blog: rel.blog
    })) || []
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<CourseWithChapters[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showPreview] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, blogsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/blogs/public')
      ]);

      if (!coursesRes.ok || !blogsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [coursesData, blogsData] = await Promise.all([
        coursesRes.json(),
        blogsRes.json()
      ]);

      // Fetch chapter topics for each course
      const coursesWithChapters = await Promise.all(
        (coursesData.data || []).map(async (course: Course) => {
          try {
            const chaptersRes = await fetch(`/api/admin/chapter-topics/${course.id}`);
            if (chaptersRes.ok) {
              const chaptersData = await chaptersRes.json();
              return {
                ...course,
                chapterTopics: chaptersData.data || []
              };
            }
            return {
              ...course,
              chapterTopics: []
            };
          } catch (error) {
            console.error(`Error fetching chapters for course ${course.id}:`, error);
            return {
              ...course,
              chapterTopics: []
            };
          }
        })
      );
      setCourses(coursesWithChapters);
      setBlogs(blogsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Check for duplicate sequence number
    if (isSequenceNumberTaken(formData.sequenceNumber)) {
      setError('This sequence number is already used in this course. Please choose a different number.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEditing ? `/api/chapter-topics/${initialData?.id}` : '/api/chapter-topics';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          blogSequences: blogSequences.map(seq => ({
            blogId: seq.blogId,
            sequence: seq.sequence
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save chapter topic');
      }

      const chapterTopic = await response.json();
      
      // Redirect to course detail page
      router.push(`/admin/courses/${formData.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chapter topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if sequence number is already used in the same course
  const isSequenceNumberTaken = (sequenceNumber: number) => {
    if (!selectedCourse) return false;
    
    return selectedCourse.chapterTopics.some(chapter => 
      chapter.sequenceNumber === sequenceNumber && 
      chapter.id !== initialData?.id
    );
  };

  const addBlogSequence = () => {
    const nextSequence = Math.max(...blogSequences.map(s => s.sequence), 0) + 1;
    const newSequence: BlogSequence = {
      id: `temp-${Date.now()}`,
      sequence: nextSequence,
      blogId: '',
      blog: {} as Blog
    };
    setBlogSequences([...blogSequences, newSequence]);
  };

  const updateBlogSequence = (id: string, updates: Partial<BlogSequence>) => {
    setBlogSequences(blogSequences.map(seq => {
      if (seq.id === id) {
        const updatedSeq = { ...seq, ...updates };
        
        // If blog is selected, populate the blog data
        if (updates.blogId) {
          const selectedBlog = blogs.find(b => b.id === updates.blogId);
          if (selectedBlog) {
            updatedSeq.blog = selectedBlog;
          }
        } else if (updates.blogId === undefined || updates.blogId === '') {
          // Clear blog selection
          updatedSeq.blogId = '';
          updatedSeq.blog = {} as Blog;
        }
        
        return updatedSeq;
      }
      return seq;
    }));
  };

  const removeBlogSequence = (id: string) => {
    const newSequences = blogSequences.filter(seq => seq.id !== id);
    // Reorder sequences
    const reorderedSequences = newSequences
      .sort((a, b) => a.sequence - b.sequence)
      .map((seq, index) => ({ ...seq, sequence: index + 1 }));
    setBlogSequences(reorderedSequences);
  };

  const moveBlogSequence = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    
    const draggedSequence = blogSequences[dragIndex];
    const newSequences = [...blogSequences];
    newSequences.splice(dragIndex, 1);
    newSequences.splice(hoverIndex, 0, draggedSequence);
    
    // Update sequence numbers
    const reorderedSequences = newSequences.map((seq, index) => ({
      ...seq,
      sequence: index + 1
    }));
    
    setBlogSequences(reorderedSequences);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      moveBlogSequence(dragIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Chapter Topic' : 'Create Chapter Topic'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update chapter topic information' : 'Fill in the details to create a new chapter topic'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  id="courseId"
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting || !!courseId}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sequence Number */}
              <div>
                <label htmlFor="sequenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Number *
                </label>
                <input
                  type="number"
                  id="sequenceNumber"
                  value={formData.sequenceNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('sequenceNumber', value === '' ? 1 : parseInt(value, 10));
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 ${
                    isSequenceNumberTaken(formData.sequenceNumber) 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  min="1"
                  required
                  disabled={isSubmitting}
                />
                {isSequenceNumberTaken(formData.sequenceNumber) && (
                  <p className="mt-1 text-sm text-red-600">
                    This sequence number is already used in this course. Please choose a different number.
                  </p>
                )}
              </div>

              {/* Chapter Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  {/* Toolbar */}
                  {descriptionEditor && <MenuBar editor={descriptionEditor} />}
                  
                  {/* Editor */}
                  <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
                    <EditorContent 
                      editor={descriptionEditor} 
                      className="prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Blog Sequences Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Blog Sequences</h3>
                  <button
                    type="button"
                    onClick={addBlogSequence}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Blog
                  </button>
                </div>

                {blogs.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          No Blogs Available
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>You need to create some blogs before you can add them to chapter topics.</p>
                          <p className="mt-1">
                            <a href="/admin/blogs" className="font-medium underline text-yellow-800 hover:text-yellow-900">
                              Go to Blogs Management →
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {blogSequences.map((sequence, index) => (
                    <div
                      key={sequence.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-200 cursor-move ${
                        draggedIndex === index 
                          ? 'opacity-50 transform rotate-2 scale-105 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {sequence.sequence}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Blog {sequence.sequence}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBlogSequence(sequence.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <SearchableSelect
                        options={blogs.map((blog) => ({
                          value: blog.id,
                          label: `${blog.title} [${blog.status}]`
                        }))}
                        value={sequence.blogId || ''}
                        onChange={(blogId) => updateBlogSequence(sequence.id, { blogId: blogId || undefined })}
                        placeholder={blogs.length === 0 ? "No blogs available" : "Select a blog"}
                        disabled={isSubmitting}
                        className="w-full"
                      />

                      {sequence.blog && sequence.blog.title && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600">
                            <strong>Selected:</strong> {sequence.blog.title} 
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              sequence.blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                              sequence.blog.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sequence.blog.status}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.courseId || !formData.name.trim() || !formData.description.trim() || isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? 'Update Chapter Topic' : 'Create Chapter Topic'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          </div>
          <div className="p-6">
            {selectedCourse ? (
              <div className="space-y-4">
                {/* Course Name */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h1 className="text-xl font-bold text-blue-900">
                    {selectedCourse.name}
                  </h1>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* All Chapter Topics */}
                <div className="space-y-3">
                  {(() => {
                    // Create a combined list of existing chapters and the current form data
                    const allChapters = selectedCourse.chapterTopics.map(chapter => ({
                      ...chapter,
                      isFormData: false
                    }));
                    
                    // If editing, replace the existing chapter with form data
                    if (isEditing && initialData?.id) {
                      const formChapter = {
                        id: initialData.id,
                        courseId: formData.courseId,
                        sequenceNumber: formData.sequenceNumber,
                        name: formData.name,
                        description: formData.description,
                        blogRelations: blogSequences.map(seq => ({
                          id: seq.id,
                          blogId: seq.blogId,
                          sequence: seq.sequence,
                          blog: seq.blog
                        })),
                        isFormData: true
                      };
                      
                      // Replace the existing chapter with form data
                      const chapterIndex = allChapters.findIndex(ch => ch.id === initialData.id);
                      if (chapterIndex !== -1) {
                        allChapters[chapterIndex] = formChapter;
                      }
                    }
                    
                    // Sort by sequence number
                    return allChapters
                      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                      .map((chapter, index) => {
                      const isBeingEdited = chapter.isFormData || (isEditing && chapter.id === initialData?.id);
                      return (
                        <div key={chapter.id} className={`rounded-lg p-4 ${
                          isBeingEdited 
                            ? 'bg-blue-50 border-2 border-blue-200' 
                            : 'bg-gray-50'
                        }`}>
                          <h2 className={`text-lg font-bold mb-2 ${
                            isBeingEdited ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            Chapter {chapter.sequenceNumber}: {chapter.name}
                            {isBeingEdited && (
                              <span className="ml-2 text-sm font-normal text-blue-600">(Editing)</span>
                            )}
                          </h2>
                          <details className="group" open={isBeingEdited}>
                            <summary className={`cursor-pointer text-sm flex items-center ${
                              isBeingEdited 
                                ? 'text-blue-700 hover:text-blue-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}>
                              <span className="mr-2">
                                <ChevronDown className="w-4 h-4" />
                              </span>
                              <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: chapter.description || 'Chapter description will appear here'
                                }}
                              />
                            </summary>
                            <div className={`mt-2 pl-4 border-l-2 ${
                              isBeingEdited ? 'border-blue-300' : 'border-gray-300'
                            }`}>
                              <div className="space-y-2">
                                {chapter.blogRelations
                                  ?.filter(rel => rel.blog && rel.blog.title)
                                  .sort((a, b) => a.sequence - b.sequence)
                                  .map((relation) => (
                                    <div key={relation.id} className={`text-sm flex items-center ${
                                      isBeingEdited ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                                        isBeingEdited 
                                          ? 'bg-blue-100 text-blue-600' 
                                          : 'bg-blue-100 text-blue-600'
                                      }`}>
                                        {relation.sequence}
                                      </span>
                                      {relation.blog.title}
                                    </div>
                                  ))}
                                {(!chapter.blogRelations || chapter.blogRelations.length === 0) && (
                                  <p className={`text-sm italic ${
                                    isBeingEdited ? 'text-blue-500' : 'text-gray-500'
                                  }`}>
                                    No blogs added yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </details>
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Current Chapter Topic (only show when creating new, not editing) */}
                  {formData.name && !isEditing && (
                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                      <h2 className="text-lg font-bold text-green-900 mb-2">
                        Chapter {formData.sequenceNumber}: {formData.name}
                      </h2>
                      <details className="group" open>
                        <summary className="cursor-pointer text-sm text-green-700 hover:text-green-900 flex items-center">
                          <span className="mr-2">
                            <ChevronDown className="w-4 h-4" />
                          </span>
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: formData.description || 'Chapter description will appear here' 
                            }}
                          />
                        </summary>
                        <div className="mt-2 pl-4 border-l-2 border-green-300">
                          <div className="space-y-2">
                            {blogSequences
                              .filter(seq => seq.blogId && seq.blog.title)
                              .sort((a, b) => a.sequence - b.sequence)
                              .map((sequence) => (
                                <div key={sequence.id} className="text-sm text-green-700 flex items-center">
                                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600 mr-2">
                                    {sequence.sequence}
                                  </span>
                                  {sequence.blog.title}
                                </div>
                              ))}
                            {blogSequences.filter(seq => seq.blogId && seq.blog.title).length === 0 && (
                              <p className="text-sm text-green-500 italic">No blogs added yet</p>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a course to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
