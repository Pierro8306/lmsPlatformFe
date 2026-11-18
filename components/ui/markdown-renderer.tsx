'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-invert max-w-none text-[#E6E9F0] text-sm leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-[#2A3142]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-white mt-4 mb-2 pb-1 border-b border-[#232938]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-[#E6E9F0] mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-3 text-[#9AA3B5] last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 text-[#9AA3B5] space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 text-[#9AA3B5] space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500 pl-4 py-1 italic bg-[#151923]/60 rounded-r my-3 text-[#9AA3B5]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-left text-xs border-collapse border border-[#2A3142]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[#1A1F2B] text-white p-2 border border-[#2A3142] font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2 border border-[#2A3142] text-[#9AA3B5]">{children}</td>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="bg-[#1A1F2B] text-cyan-300 font-mono text-xs px-1.5 py-0.5 rounded border border-[#2A3142]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#0F1218] border border-[#2A3142] text-zinc-200 font-mono text-xs p-3.5 rounded-lg overflow-x-auto my-3 leading-normal">
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
