import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ onSearch, currentArray, isSearchAlgorithm }) => {
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const target = parseInt(searchValue);
    
    if (isNaN(target)) {
      setError('Please enter a valid number');
      return;
    }
    
    setError('');
    onSearch(target);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const suggestRandomValue = () => {
    const randomValue = currentArray[Math.floor(Math.random() * currentArray.length)];
    setSearchValue(randomValue.toString());
  };

  if (!isSearchAlgorithm) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <Search className="h-5 w-5 mr-2 text-blue-400" />
        Search Target
      </h3>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter number to search for"
            className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={!searchValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
          >
            Search
          </button>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        
        <button
          onClick={suggestRandomValue}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
        >
          Use random value from array
        </button>
        
        <div className="text-xs text-gray-400">
          Available values: {currentArray.slice(0, 10).join(', ')}{currentArray.length > 10 ? '...' : ''}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;