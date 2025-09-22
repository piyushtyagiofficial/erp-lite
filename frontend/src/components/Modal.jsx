import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-secondary-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" 
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-large transform transition-all duration-300 sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full animate-slide-up`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-white to-primary-50 px-6 pt-6 pb-4 border-b border-secondary-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-secondary-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;