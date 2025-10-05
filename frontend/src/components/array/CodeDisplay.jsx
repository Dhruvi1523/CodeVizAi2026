import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { getAlgorithmCode } from '../../data/algorithmCode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeDisplay = ({ algorithmId, algorithmName }) => {
  const [copied, setCopied] = useState(false);
  const code = getAlgorithmCode(algorithmId);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#334155] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-[#6366f1]" />
          <h3 className="text-lg font-semibold text-[#f1f5f9]">{algorithmName}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#334155] hover:bg-opacity-80 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#14b8a6]" />
              <span className="text-sm font-medium text-[#14b8a6]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-sm font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Area with Syntax Highlighting */}
      <div className="flex-grow overflow-auto">
        <SyntaxHighlighter
          language="javascript"
          style={vscDarkPlus} // A professional dark theme for highlighting
          customStyle={{
            background: 'transparent', // Make it blend with the parent background
            margin: 0,
            padding: '1rem',
            height: '100%',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit', // Use your main mono font if you have one
              fontSize: '0.875rem', // text-sm
            }
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeDisplay;