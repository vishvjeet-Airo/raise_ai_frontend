import React from 'react';

// The component now accepts a 'lines' prop, defaulting to 3.
const FadedTextLoader = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="animate-pulse space-y-2">
      {/* This loop creates as many lines as you ask for */}
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded w-full"
          // We vary the width for a more realistic text look
          style={{ width: index === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default FadedTextLoader;