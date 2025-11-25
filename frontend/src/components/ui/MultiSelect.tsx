'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface MultiSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  helperText,
  required,
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={cn('label', required && 'label-required')}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'input min-h-[48px] cursor-pointer',
            error && 'input-error'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-dark-400 dark:text-dark-500">
              {placeholder}
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <span key={option.value} className="tag">
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(option.value);
                    }}
                    className="tag-remove"
                    aria-label={`Remove ${option.label}`}
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-dark-900 border-2 border-dark-200 dark:border-dark-700 rounded-xl shadow-xl max-h-60 overflow-auto">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                    value.includes(option.value) &&
                    'bg-primary-100 dark:bg-primary-900/30'
                  )}
                  onClick={() => handleToggle(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => { }}
                      className="checkbox"
                      tabIndex={-1}
                    />
                    <span className="text-dark-900 dark:text-dark-50">
                      {option.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="error-message" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={`${id}-helper`}
          className="text-sm text-dark-500 dark:text-dark-400 mt-1"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
