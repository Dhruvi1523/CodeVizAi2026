import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';

const ArrayInput = ({ currentArray, onArrayChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentArray.join(', '));
  const [error, setError] = useState('');

  const handleEdit = () => {
    setInputValue(currentArray.join(', '));
    setIsEditing(true);
    setError('');
  };

  const handleSave = () => {
    try {
      const values = inputValue
        .split(',')
        .map(val => val.trim())
        .filter(val => val !== '')
        .map(val => {
          const num = parseInt(val, 10);
          if (isNaN(num)) throw new Error(`"${val}" is not a valid number`);
          if (num < 1 || num > 999) throw new Error(`Numbers must be between 1 and 999`);
          return num;
        });

      if (values.length < 3) {
        setError('Array must have at least 3 elements');
        return;
      }

      if (values.length > 50) {
        setError('Array cannot have more than 50 elements');
        return;
      }

      onArrayChange(values);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input');
    }
  };

  const handleCancel = () => {
    setInputValue(currentArray.join(', '));
    setIsEditing(false);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Array Input</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-sm">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter numbers separated by commas (e.g., 64, 34, 25, 12, 22, 11, 90)"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              <Check className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            Enter 3-50 numbers between 1-999, separated by commas. Press Enter to save or Escape to cancel.
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-300 text-sm mb-2">Current Array ({currentArray.length} elements):</div>
          <div className="flex flex-wrap gap-1">
            {currentArray.map((value, index) => (
              <span
                key={index}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrayInput;
