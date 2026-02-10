'use client';

import React, { useState, KeyboardEvent, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface TagInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    id?: string;
    maxTags?: number;
    disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
    label,
    error,
    helperText,
    required,
    value = [],
    onChange,
    placeholder = 'Type and press Enter...',
    id,
    maxTags,
    disabled
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmedInput = inputValue.trim();

        if (!trimmedInput) return;

        // Check for duplicates
        if (value.includes(trimmedInput)) {
            setInputValue('');
            return;
        }

        // Check max tags
        if (maxTags && value.length >= maxTags) {
            return;
        }

        onChange([...value, trimmedInput]);
        setInputValue('');
    };

    const removeTag = (index: number) => {
        if (disabled) return;
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

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

            <div
                className={cn(
                    'input min-h-[48px] flex flex-wrap gap-2 p-2 items-center cursor-text',
                    error && 'input-error',
                    isFocused && 'ring-2 ring-primary-500/20 border-primary-500', // mimic input focus
                    disabled && 'bg-gray-50 dark:bg-dark-800 cursor-not-allowed opacity-75'
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium"
                    >
                        {tag}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(index);
                                }}
                                className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors focus:outline-none"
                                aria-label={`Remove ${tag}`}
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        addTag(); // Add tag on blur if there's text
                    }}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none focus:ring-0 p-1 text-dark-900 dark:text-dark-50 placeholder:text-dark-400 dark:placeholder:text-dark-500"
                    placeholder={value.length === 0 ? placeholder : ''}
                    disabled={disabled}
                />
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

export default TagInput;
