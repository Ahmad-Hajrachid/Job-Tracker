import React from 'react'
// Simple markdown renderer for basic formatting
const MarkdownRenderer = ({ content }) => {
  const formatMarkdown = (text) => {
    let formatted = text
      // Headers
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-800">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-400">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-md my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      
      // Lists
      .replace(/^\* (.*?)$/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
    
    formatted = '<p class="mb-3">' + formatted + '</p>';
    formatted = formatted.replace(/<p class="mb-3"><\/p>/g, '');
    
    return formatted;
  };

  return (
    <div 
      className="prose max-w-none text-black"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer