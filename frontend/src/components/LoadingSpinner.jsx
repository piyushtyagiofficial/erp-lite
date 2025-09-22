import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4 p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-secondary-200 rounded-full`}></div>
        {/* Inner spinning ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-500 border-r-primary-400 rounded-full animate-spin`}></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      {text && (
        <p className="text-secondary-600 font-medium text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;