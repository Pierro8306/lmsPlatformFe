'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write lesson content here...',
  className,
  minHeight = '240px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'focus:outline-none max-w-none text-text-primary text-sm leading-relaxed p-4 prose prose-invert',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Keep editor content in sync when content prop changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    isActive,
    onClick,
    children,
    title,
  }: {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors text-xs flex items-center justify-center',
        isActive && 'bg-accent-indigo/20 text-accent-indigo font-bold border border-accent-indigo/40'
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        'rounded-2xl border border-border-DEFAULT bg-background-card overflow-hidden focus-within:border-accent-indigo focus-within:ring-2 focus-within:ring-accent-indigo/20 transition-all',
        className
      )}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border-subtle bg-background-elevated/60">
        <ToolbarButton
          title="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-border-DEFAULT mx-1" />

        <ToolbarButton
          title="Heading 1"
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-border-DEFAULT mx-1" />

        <ToolbarButton
          title="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Ordered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Blockquote"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Code Block"
          isActive={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-border-DEFAULT mx-1" />

        <ToolbarButton
          title="Undo"
          isActive={false}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          isActive={false}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Body */}
      <div style={{ minHeight }} className="cursor-text bg-background-base/50">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
