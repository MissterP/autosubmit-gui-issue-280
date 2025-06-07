import React from 'react';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner-border" role="status"></div>
        <span className="text-gray-600 dark:text-gray-300">{message}</span>
      </div>
    </div>
  );
};

/**
 * Error State Component
 */
export const ErrorState = ({ 
  message = "An error occurred. Please try again later.",
  icon = "fa-solid fa-triangle-exclamation"
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <div className="text-center text-red-600 dark:text-red-400">
        <i className={`${icon} text-6xl mb-4`}></i>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

/**
 * No Data State Component
 */
export const NoDataState = ({ 
  title = "No Data Available",
  message = "No data found for the current selection.",
  icon = "fa-solid fa-database"
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <i className={`${icon} text-6xl mb-4`}></i>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};