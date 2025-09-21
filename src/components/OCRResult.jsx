import React from 'react';
import { FileText, Copy, Check, X } from 'lucide-react';

export const OCRResult = ({ 
  extractedText, 
  matchedProducts, 
  onClear, 
  capturedImage 
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = (text, matches) => {
    if (matches.length === 0) return text;
    
    const regex = new RegExp(`(${matches.join('|')})`, 'gi');
    return text.split(regex).map((part, index) => {
      const isMatch = matches.some(match => 
        part.toLowerCase() === match.toLowerCase()
      );
      
      return isMatch ? (
        <span key={index} className="bg-green-200 text-green-900 px-1 rounded font-medium">
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Extracted Text
          </h2>
          <div className="flex items-center gap-2">
            {matchedProducts.length > 0 && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <Check className="w-4 h-4" />
                {matchedProducts.length} match{matchedProducts.length !== 1 ? 'es' : ''}
              </div>
            )}
            <button
              onClick={copyToClipboard}
              className={`p-2 rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="Copy text"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClear}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear result"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {capturedImage && (
          <div className="mb-4">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full max-w-sm mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
        
        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
          {extractedText ? (
            <div className="text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {highlightMatches(extractedText, matchedProducts)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <FileText className="w-8 h-8 mb-2" />
              <p>Extracted text will appear here</p>
            </div>
          )}
        </div>

        {matchedProducts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Matched Products:</h3>
            <div className="flex flex-wrap gap-2">
              {matchedProducts.map((match, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {match}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};