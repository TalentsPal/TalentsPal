import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  message, 
  onDismiss, 
  type = 'error' 
}: ErrorMessageProps) {
  const styles = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-600 dark:text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-600 dark:text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-500',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl p-4 mb-4`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <FiAlertCircle className={`${style.icon} text-xl flex-shrink-0 mt-0.5`} />
        <p className={`${style.text} text-sm flex-1`}>{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.text} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
}
