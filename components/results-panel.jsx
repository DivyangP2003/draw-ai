"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import "@/app/styles/markdown.css";   // Keep your markdown styles

export default function ResultsPanel({ result, error, isAnalyzing }) {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 min-h-[200px] flex flex-col items-center justify-center shadow-sm transition-all duration-300">
      {isAnalyzing && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Analyzing your masterpiece… 🎨
          </p>
        </div>
      )}

      {!isAnalyzing && error && (
        <p className="text-red-500 text-center font-medium">{error}</p>
      )}

      {!isAnalyzing && result && (
        <div className="markdown-body text-left w-full mt-2 overflow-y-auto max-h-[400px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {result}
          </ReactMarkdown>
        </div>
      )}

      {!isAnalyzing && !result && !error && (
        <p className="text-gray-400 dark:text-gray-500 text-center">
          Draw something to get started!
        </p>
      )}
    </div>
  );
}
