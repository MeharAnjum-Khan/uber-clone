'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto mt-8 shadow-sm">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-lg font-bold text-red-800">System Error</h3>
        <p className="text-red-700 mt-1">{typeof message === 'string' ? message : JSON.stringify(message)}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
