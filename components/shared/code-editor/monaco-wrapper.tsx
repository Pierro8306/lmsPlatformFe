'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import type { Language } from '@/types/problem';

interface MonacoWrapperProps {
  value: string;
  language: Language;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  height?: string | number;
  highlightedLines?: Array<{ lineNumber: number; severity: 'suggestion' | 'issue' | 'critical' }>;
  onLineClick?: (lineNumber: number) => void;
  onRunShortcut?: () => void;
  onSubmitShortcut?: () => void;
}

const MONACO_LANG_MAP: Record<Language, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
};

export default function MonacoWrapper({
  value,
  language,
  onChange,
  readOnly = false,
  fontSize = 14,
  height = '100%',
  highlightedLines = [],
  onLineClick,
  onRunShortcut,
  onSubmitShortcut,
}: MonacoWrapperProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define our custom LMS Dark theme matching #0B0D12 / #0F1218 / #151923
    monaco.editor.defineTheme('eduflow-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'E6E9F0', background: '0B0D12' },
        { token: 'comment', foreground: '6B7385', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8', fontStyle: 'bold' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'type', foreground: '22D3EE' },
        { token: 'function', foreground: 'A78BFA' },
        { token: 'variable', foreground: 'E6E9F0' },
        { token: 'operator', foreground: 'C084FC' },
      ],
      colors: {
        'editor.background': '#0B0D12',
        'editor.foreground': '#E6E9F0',
        'editor.lineHighlightBackground': '#151923',
        'editor.selectionBackground': '#2A3142',
        'editorCursor.foreground': '#6366F1',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#9AA3B5',
        'editorGutter.background': '#0B0D12',
        'editorGutter.commentRangeForeground': '#818CF8',
        'scrollbarSlider.background': '#23293880',
        'scrollbarSlider.hoverBackground': '#2A3142',
        'scrollbarSlider.activeBackground': '#374151',
      },
    });

    monaco.editor.setTheme('eduflow-dark');

    // Keyboard Shortcuts:
    // Ctrl/Cmd + Enter = Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunShortcut) onRunShortcut();
    });

    // Ctrl/Cmd + Shift + Enter = Submit
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        if (onSubmitShortcut) onSubmitShortcut();
      }
    );

    // Line click listener (for inline code review comments)
    editor.onMouseDown((e: any) => {
      if (
        onLineClick &&
        e.target &&
        e.target.position &&
        e.target.element?.classList?.contains('line-numbers')
      ) {
        onLineClick(e.target.position.lineNumber);
      }
    });

    applyDecorations();
  };

  const applyDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = highlightedLines.map((hl) => {
      let glyphClass = 'bg-amber-500 rounded-full w-2 h-2 ml-1';
      let lineClass = 'bg-amber-500/10 border-l-2 border-amber-500';

      if (hl.severity === 'critical') {
        glyphClass = 'bg-rose-500 rounded-full w-2 h-2 ml-1';
        lineClass = 'bg-rose-500/10 border-l-2 border-rose-500';
      } else if (hl.severity === 'suggestion') {
        glyphClass = 'bg-indigo-500 rounded-full w-2 h-2 ml-1';
        lineClass = 'bg-indigo-500/10 border-l-2 border-indigo-500';
      }

      return {
        range: new monaco.Range(hl.lineNumber, 1, hl.lineNumber, 1),
        options: {
          isWholeLine: true,
          className: lineClass,
          glyphMarginClassName: glyphClass,
          hoverMessage: { value: `**Instructor Note on Line ${hl.lineNumber}** (${hl.severity})` },
        },
      };
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  };

  useEffect(() => {
    applyDecorations();
  }, [highlightedLines]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0B0D12]">
      <Editor
        height={height}
        language={MONACO_LANG_MAP[language] || 'plaintext'}
        value={value}
        onChange={(val) => onChange && onChange(val || '')}
        theme="eduflow-dark"
        options={{
          readOnly,
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: true,
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          folding: true,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
