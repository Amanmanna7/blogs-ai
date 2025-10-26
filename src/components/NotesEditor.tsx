'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Emoji } from '@tiptap/extension-emoji';
import { FontFamily } from '@tiptap/extension-font-family';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Code2, 
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import '@/styles/tiptap.css';
import '@/styles/notes.css';

// Import common programming languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

// Create lowlight instance and register languages
const lowlight = createLowlight();

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('bash', bash);

interface NotesEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  width?: number;
}

// Responsive MenuBar component
function ResponsiveMenuBar({ editor, width = 400 }: { editor: any; width: number }) {
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  
  const editorState = useEditorState({
    editor,
    selector: (ctx: any) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isTaskList: ctx.editor.isActive('taskList') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isTable: ctx.editor.isActive('table') ?? false,
        isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isAlignRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  });

  const isCompact = width < 350;
  const isVeryCompact = width < 250;

  const BasicButtons = () => (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`notes-menu-btn ${editorState.isBold ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Bold"
      >
        <Bold size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`notes-menu-btn ${editorState.isItalic ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Italic"
      >
        <Italic size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`notes-menu-btn ${editorState.isTaskList ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Todo List"
      >
        <CheckSquare size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`notes-menu-btn ${editorState.isBulletList ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Bullet List"
      >
        <List size={isVeryCompact ? 12 : 14} />
      </button>
    </>
  );

  const AdvancedButtons = () => (
    <>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`notes-menu-btn ${editorState.isUnderline ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Underline"
      >
        <UnderlineIcon size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`notes-menu-btn ${editorState.isStrike ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`notes-menu-btn ${editorState.isCode ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Inline Code"
      >
        <Code size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`notes-menu-btn ${editorState.isOrderedList ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`notes-menu-btn ${editorState.isBlockquote ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Quote"
      >
        <Quote size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`notes-menu-btn ${editorState.isCodeBlock ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Code Block"
      >
        <Code2 size={isVeryCompact ? 12 : 14} />
      </button>
    </>
  );

  const AlignmentButtons = () => (
    <>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`notes-menu-btn ${editorState.isAlignLeft ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Align Left"
      >
        <AlignLeft size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`notes-menu-btn ${editorState.isAlignCenter ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Align Center"
      >
        <AlignCenter size={isVeryCompact ? 12 : 14} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`notes-menu-btn ${editorState.isAlignRight ? 'active' : ''} ${isVeryCompact ? 'compact' : ''}`}
        title="Align Right"
      >
        <AlignRight size={isVeryCompact ? 12 : 14} />
      </button>
    </>
  );

  const TableButtons = () => (
    <>
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
        title="Insert Table"
      >
        <TableIcon size={isVeryCompact ? 12 : 14} />
      </button>
      {editorState.isTable && (
        <>
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Add Column Before"
          >
            +Col
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Add Column After"
          >
            Col+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Delete Column"
          >
            -Col
          </button>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Add Row Before"
          >
            +Row
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Add Row After"
          >
            Row+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Delete Row"
          >
            -Row
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
            title="Delete Table"
          >
            -Table
          </button>
        </>
      )}
    </>
  );

  return (
    <div className={`notes-menu-bar ${isCompact ? 'compact' : ''}`}>
      <BasicButtons />
      
      {!isVeryCompact && (
        <>
          <div className="notes-menu-separator" />
          <AdvancedButtons />
        </>
      )}
      
      {!isCompact && (
        <>
          <div className="notes-menu-separator" />
          <AlignmentButtons />
        </>
      )}
      
      {!isCompact && (
        <>
          <div className="notes-menu-separator" />
          <TableButtons />
        </>
      )}
      
      {isCompact && (
        <>
          <div className="notes-menu-separator" />
          <div className="notes-menu-dropdown">
            <button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
              title="More Options"
            >
              <MoreHorizontal size={isVeryCompact ? 12 : 14} />
            </button>
            {showAdvancedMenu && (
              <div className="notes-menu-dropdown-content">
                <div className="grid grid-cols-2 gap-2">
                  <AdvancedButtons />
                  <AlignmentButtons />
                  <TableButtons />
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="notes-menu-separator" />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
        title="Undo"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        className={`notes-menu-btn ${isVeryCompact ? 'compact' : ''}`}
        title="Redo"
      >
        ↷
      </button>
    </div>
  );
}

export default function NotesEditor({ content, onUpdate, width = 400 }: NotesEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted before rendering editor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TipTap editor configuration
  const editor = useEditor({
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
      Table.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: 'table-auto border-collapse',
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => {
                if (!attributes.class) {
                  return {};
                }
                return {
                  class: attributes.class,
                };
              },
            },
          };
        },
      }).configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),
      HorizontalRule,
      Subscript,
      Superscript,
      Underline,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
        itemTypeName: 'taskItem',
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'task-item',
        },
        nested: true,
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
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Debounce updates to avoid too many saves
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        onUpdate(editor.getHTML());
      }, 500);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!isMounted || !editor) {
    return (
      <div className="notes-editor-content">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-editor-container">
      <ResponsiveMenuBar editor={editor} width={width} />
      <div className="notes-editor-content">
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
}
