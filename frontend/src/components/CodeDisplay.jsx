import React from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { getAlgorithmCode } from '../data/algorithmCode';

interface CodeDisplayProps {
  algorithmId: string;
  algorithmName: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ algorithmId, algorithmName }) => {
  const [copied, setCopied] = useState(false);
  const code = getAlgorithmCode(algorithmId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">{algorithmName} Code</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm text-gray-300 leading-relaxed">
          <code className="language-javascript">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeDisplay;