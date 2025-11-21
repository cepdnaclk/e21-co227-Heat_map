import React from 'react';

const ErrorView = ({ message = "An error occurred.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorView;