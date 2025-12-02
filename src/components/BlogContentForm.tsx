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
import { createLowlight } from 'lowlight';
import { useRole } from '@/hooks/useRole';
import EmojiPicker from 'emoji-picker-react';
import '@/styles/tiptap.css';

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
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import dart from 'highlight.js/lib/languages/dart';
import r from 'highlight.js/lib/languages/r';
import matlab from 'highlight.js/lib/languages/matlab';
import scala from 'highlight.js/lib/languages/scala';
import clojure from 'highlight.js/lib/languages/clojure';
import haskell from 'highlight.js/lib/languages/haskell';
import lua from 'highlight.js/lib/languages/lua';
import perl from 'highlight.js/lib/languages/perl';
import powershell from 'highlight.js/lib/languages/powershell';
import yaml from 'highlight.js/lib/languages/yaml';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import markdown from 'highlight.js/lib/languages/markdown';

// Create lowlight instance and register all languages
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
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('kotlin', kotlin);
lowlight.register('dart', dart);
lowlight.register('r', r);
lowlight.register('matlab', matlab);
lowlight.register('scala', scala);
lowlight.register('clojure', clojure);
lowlight.register('haskell', haskell);
lowlight.register('lua', lua);
lowlight.register('perl', perl);
lowlight.register('powershell', powershell);
lowlight.register('yaml', yaml);
lowlight.register('dockerfile', dockerfile);
lowlight.register('markdown', markdown);

// MenuBar component with proper state management
function MenuBar({ editor }: { editor: any }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTableStyles, setShowTableStyles] = useState(false);
  
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
        isSubscript: ctx.editor.isActive('subscript') ?? false,
        canSubscript: ctx.editor.can().chain().toggleSubscript().run() ?? false,
        isSuperscript: ctx.editor.isActive('superscript') ?? false,
        canSuperscript: ctx.editor.can().chain().toggleSuperscript().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        isTable: ctx.editor.isActive('table') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
        isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isAlignRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        currentLanguage: ctx.editor.getAttributes('codeBlock').language || '',
        currentFontFamily: ctx.editor.getAttributes('textStyle').fontFamily || '',
        currentFontSize: ctx.editor.getAttributes('textStyle').fontSize || '',
        currentColor: ctx.editor.getAttributes('textStyle').color || '',
      }
    },
  });

  return (
    <div className="sticky top-[65px] z-30 border-2 border-blue-400 border-b-2 border-b-blue-500 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1 shadow-[0_2px_8px_rgba(59,130,246,0.25),0_1px_3px_rgba(59,130,246,0.15)]">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isBold ? 'bg-gray-300' : ''
        }`}
        title="Bold - Make selected text bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isItalic ? 'bg-gray-300' : ''
        }`}
        title="Italic - Make selected text italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editorState.canUnderline}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isUnderline ? 'bg-gray-300' : ''
        }`}
        title="Underline - Underline selected text (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isStrike ? 'bg-gray-300' : ''
        }`}
        title="Strikethrough - Add strikethrough to selected text"
      >
        <s>S</s>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        disabled={!editorState.canSubscript}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isSubscript ? 'bg-gray-300' : ''
        }`}
        title="Subscript - Make selected text smaller and lower (for formulas)"
      >
        X₂
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        disabled={!editorState.canSuperscript}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isSuperscript ? 'bg-gray-300' : ''
        }`}
        title="Superscript - Make selected text smaller and higher (for exponents)"
      >
        X²
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isCode ? 'bg-gray-300' : ''
        }`}
        title="Inline Code - Format selected text as inline code"
      >
        {'</>'}
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Font Controls */}
      <select
        onChange={(e) => {
          const fontFamily = e.target.value;
          if (fontFamily) {
            editor.chain().focus().setMark('textStyle', { fontFamily }).run();
          } else {
            editor.chain().focus().unsetMark('textStyle').run();
          }
        }}
        value={editorState.currentFontFamily}
        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        title="Font Family - Change the font family of selected text"
      >
        <option value="">Font Family</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="Times New Roman, serif">Times New Roman</option>
        <option value="Helvetica, sans-serif">Helvetica</option>
        <option value="Verdana, sans-serif">Verdana</option>
        <option value="Courier New, monospace">Courier New</option>
        <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
        <option value="Impact, sans-serif">Impact</option>
        <option value="Comic Sans MS, cursive">Comic Sans MS</option>
        <option value="Palatino, serif">Palatino</option>
        <option value="Garamond, serif">Garamond</option>
        <option value="Bookman, serif">Bookman</option>
        <option value="Avant Garde, sans-serif">Avant Garde</option>
        <option value="Futura, sans-serif">Futura</option>
        <option value="Lucida Console, monospace">Lucida Console</option>
      </select>
      
      <select
        onChange={(e) => {
          const fontSize = e.target.value;
          if (fontSize) {
            editor.chain().focus().setMark('textStyle', { fontSize }).run();
          } else {
            editor.chain().focus().unsetMark('textStyle').run();
          }
        }}
        value={editorState.currentFontSize}
        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        title="Font Size - Change the font size of selected text"
      >
        <option value="">Font Size</option>
        <option value="8px">8px</option>
        <option value="9px">9px</option>
        <option value="10px">10px</option>
        <option value="11px">11px</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="28px">28px</option>
        <option value="32px">32px</option>
        <option value="36px">36px</option>
        <option value="48px">48px</option>
        <option value="64px">64px</option>
        <option value="72px">72px</option>
      </select>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isParagraph ? 'bg-gray-300' : ''
        }`}
        title="Paragraph - Convert to normal paragraph text"
      >
        P
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isHeading1 ? 'bg-gray-300' : ''
        }`}
        title="Heading 1 - Convert to main heading (largest)"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isHeading2 ? 'bg-gray-300' : ''
        }`}
        title="Heading 2 - Convert to subheading (medium)"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isHeading3 ? 'bg-gray-300' : ''
        }`}
        title="Heading 3 - Convert to subheading (smallest)"
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
        title="Bullet List - Create unordered list with bullet points"
      >
        •
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isOrderedList ? 'bg-gray-300' : ''
        }`}
        title="Numbered List - Create ordered list with numbers"
      >
        1.
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isAlignLeft ? 'bg-gray-300' : ''
        }`}
        title="Align Left - Align text to the left"
      >
        ⬅
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isAlignCenter ? 'bg-gray-300' : ''
        }`}
        title="Align Center - Center align text"
      >
        ⬆
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isAlignRight ? 'bg-gray-300' : ''
        }`}
        title="Align Right - Align text to the right"
      >
        ➡
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Other formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isBlockquote ? 'bg-gray-300' : ''
        }`}
        title="Quote - Create a blockquote for highlighting text"
      >
        "
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
          editorState.isCodeBlock ? 'bg-gray-300' : ''
        }`}
        title="Code Block - Insert a code block with syntax highlighting"
      >
        {'</>'}
      </button>
      
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Horizontal Rule - Insert a horizontal line divider"
      >
        ═
      </button>
      
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Insert Table - Create a 3x3 table with header row"
      >
        ⊞
      </button>
      
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Emoji Picker - Insert emojis and symbols"
      >
        😀
      </button>
      
      {/* Table Controls */}
      {editorState.isTable && (
        <>
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Add Column Before - Insert a new column to the left of current position"
          >
            +Col
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Add Column After - Insert a new column to the right of current position"
          >
            Col+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Delete Column - Remove the current column"
          >
            -Col
          </button>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Add Row Before - Insert a new row above current position"
          >
            +Row
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Add Row After - Insert a new row below current position"
          >
            Row+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Delete Row - Remove the current row"
          >
            -Row
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Table Style Controls */}
          <button
            onClick={() => setShowTableStyles(!showTableStyles)}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Table Styles - Apply different table styles and formatting"
          >
            🎨 Styles
          </button>
          
          <button
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Merge Cells - Combine selected cells into one"
          >
            ⬜ Merge
          </button>
          
          <button
            onClick={() => editor.chain().focus().splitCell().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Split Cell - Split merged cell back into individual cells"
          >
            ⬜ Split
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Header Column - Toggle first column as header"
          >
            📋 Header Col
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Header Row - Toggle first row as header"
          >
            📋 Header Row
          </button>
          
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200"
            title="Delete Table - Remove the entire table"
          >
            -Table
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
        </>
      )}
      
      {/* Language Selector for Code Blocks */}
      {editorState.isCodeBlock && (
        <select
          onChange={(e) => {
            const language = e.target.value;
            if (language) {
              editor.chain().focus().updateAttributes('codeBlock', { language }).run();
            } else {
              editor.chain().focus().updateAttributes('codeBlock', { language: null }).run();
            }
          }}
          value={editorState.currentLanguage}
          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="Select Programming Language - Choose syntax highlighting language for code block"
        >
          <option value="">Select Language</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="csharp">C#</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="sql">SQL</option>
          <option value="json">JSON</option>
          <option value="bash">Bash</option>
          <option value="shell">Shell</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
          <option value="dart">Dart</option>
          <option value="r">R</option>
          <option value="matlab">MATLAB</option>
          <option value="scala">Scala</option>
          <option value="clojure">Clojure</option>
          <option value="haskell">Haskell</option>
          <option value="lua">Lua</option>
          <option value="perl">Perl</option>
          <option value="powershell">PowerShell</option>
          <option value="yaml">YAML</option>
          <option value="dockerfile">Dockerfile</option>
          <option value="markdown">Markdown</option>
          <option value="xml">XML</option>
          <option value="diff">Diff</option>
          <option value="plaintext">Plain Text</option>
        </select>
      )}
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Link */}
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Add Link - Insert a hyperlink to selected text"
      >
        🔗
      </button>
      
      {/* Color picker */}
      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        title="Text Color - Change the color of selected text"
      />
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Clear formatting */}
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        disabled={!editorState.canClearMarks}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Clear Formatting - Remove all text formatting from selected text"
      >
        Clear
      </button>
      
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Undo - Undo the last action (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        title="Redo - Redo the last undone action (Ctrl+Y)"
      >
        ↷
      </button>
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              editor.chain().focus().insertContent(emojiData.emoji).run();
              setShowEmojiPicker(false);
            }}
            width={350}
            height={400}
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: true,
              defaultEmoji: '1f60a',
            }}
          />
        </div>
      )}
      
      {/* Table Styles Dropdown */}
      {showTableStyles && editorState.isTable && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[200px]">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Table Styles</h4>
            
            {/* Border Styles */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Border Style</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-bordered' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Bordered Table"
                >
                  ⬜ Bordered
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-borderless' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Borderless Table"
                >
                  ⬜ No Border
                </button>
              </div>
            </div>
            
            {/* Table Themes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Table Theme</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-default' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Default Theme"
                >
                  Default
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-striped' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Striped Rows"
                >
                  Striped
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-hover' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Hover Effect"
                >
                  Hover
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('table', { class: 'table-dark' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Dark Theme"
                >
                  Dark
                </button>
              </div>
            </div>
            
            {/* Cell Formatting */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Cell Formatting</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('tableCell', { style: 'background-color: #f8f9fa' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Light Gray Background"
                >
                  🎨 Light
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('tableCell', { style: 'background-color: #e9ecef' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Medium Gray Background"
                >
                  🎨 Medium
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('tableCell', { style: 'background-color: #dee2e6' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Dark Gray Background"
                >
                  🎨 Dark
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('tableCell', { style: 'background-color: transparent' }).run();
                    setShowTableStyles(false);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  title="Clear Background"
                >
                  🎨 Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BlogContentFormProps {
  initialContent?: string;
  initialName?: string;
  initialSlug?: string;
  onSave: (data: { name: string; slug: string; content: string }) => Promise<void>;
  isEditing?: boolean;
  contentId?: string;
}

export default function BlogContentForm({
  initialContent = '',
  initialName = '',
  initialSlug = '',
  onSave,
  isEditing = false,
  contentId
}: BlogContentFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const { user, isAuthor, isEditor } = useRole();
  
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted before rendering editor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to check if slug is unique
  const checkSlugUniqueness = async (slugToCheck: string) => {
    if (!slugToCheck.trim()) {
      setSlugError('');
      return;
    }

    setIsCheckingSlug(true);
    try {
      const response = await fetch(`/api/blog-content/check-slug?slug=${encodeURIComponent(slugToCheck)}${contentId ? `&excludeId=${contentId}` : ''}`);
      const data = await response.json();
      
      if (data.exists) {
        setSlugError('This slug is already taken. Please choose a different one.');
      } else {
        setSlugError('');
      }
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      setSlugError('Error checking slug availability. Please try again.');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Debounced slug checking
  useEffect(() => {
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
    }

    if (slug.trim()) {
      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlugUniqueness(slug);
      }, 500);
    } else {
      setSlugError('');
    }

    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, [slug, contentId]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (newName: string) => {
    setName(newName);
    setNameError('');
    
    // Auto-generate slug if it's empty or matches the previous name
    if (!slug || slug === generateSlug(initialName)) {
      const newSlug = generateSlug(newName);
      setSlug(newSlug);
    }
  };

  // Handle slug change
  const handleSlugChange = (newSlug: string) => {
    const formattedSlug = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
    
    setSlug(formattedSlug);
    setSlugError('');
  };

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
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHasUnsavedChanges(true);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const handleSave = async () => {
    if (!editor) return;
    
    // Validate form fields
    let hasErrors = false;
    
    if (!name.trim()) {
      setNameError('Name is required');
      hasErrors = true;
    }
    
    if (!slug.trim()) {
      setSlugError('Slug is required');
      hasErrors = true;
    }
    
    const content = editor.getHTML();
    if (!content.trim() || content === '<p></p>') {
      alert('Please add some content before saving.');
      return;
    }

    if (hasErrors) {
      return;
    }

    if (slugError) {
      alert('Please fix the slug error before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), content });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Code block with Ctrl/Cmd + Alt + C
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'c') {
      e.preventDefault();
      editor?.chain().focus().toggleCodeBlock().run();
    }
  };

  // Check if user has permission to edit
  if (!isAuthor && !isEditor) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to create or edit blog content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Blog Content' : 'Create New Blog Content'}
            </h2>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-500 font-medium">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter blog content name"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>

            {/* Slug Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
                {isCheckingSlug && (
                  <span className="ml-2 text-blue-500 text-xs">Checking...</span>
                )}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  slugError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="url-friendly-slug"
                required
              />
              {slugError && (
                <p className="mt-1 text-sm text-red-600">{slugError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                URL-friendly version of the name (auto-generated)
              </p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            
            {/* Toolbar */}
            {isMounted && editor && <MenuBar editor={editor} />}
            
            {/* Editor */}
            <div className="border border-gray-300 rounded-b-lg overflow-hidden">
              {isMounted && editor ? (
                <EditorContent 
                  editor={editor} 
                  className="min-h-[400px] focus:outline-none"
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading editor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>Use Ctrl/Cmd + S to save quickly</p>
              <p>Use Ctrl/Cmd + Alt + C for code blocks</p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isMounted || !editor || !name.trim() || !slug.trim() || !editor.getHTML() || editor.getHTML() === '<p></p>' || !!slugError || isCheckingSlug}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
