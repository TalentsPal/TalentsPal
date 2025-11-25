'use client';

import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      success,
      helperText,
      required,
      icon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={cn('label', required && 'label-required')}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 pointer-events-none flex items-center justify-center">
              <div className="text-lg">
                {icon}
              </div>
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              'input',
              'h-12',
              icon ? 'pl-14' : 'pl-4',
              (isPassword || rightIcon) ? 'pr-14' : 'pr-4',
              error && 'input-error',
              success && 'input-success',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors flex items-center justify-center"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <div className="text-lg">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </div>
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 pointer-events-none flex items-center justify-center">
              <div className="text-lg">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p id={`${props.id}-error`} className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && !error && (
          <p className="success-message">{success}</p>
        )}

        {helperText && !error && !success && (
          <p
            id={`${props.id}-helper`}
            className="text-sm text-dark-500 dark:text-dark-400 mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
