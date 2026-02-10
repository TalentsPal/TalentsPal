'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface TagInputProps {
    label?: string;
    error?: string;
    helperText?: React.ReactNode;
    required?: boolean;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    id?: string;
    maxTags?: number;
    disabled?: boolean;
    onSearch?: (query: string) => Promise<string[]>;
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
    disabled,
    onSearch
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        if (!onSearch || !inputValue.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await onSearch(inputValue);
                // Filter out already selected tags
                setSuggestions(results.filter(tag => !value.includes(tag)));
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, onSearch, value]);

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
        <div className="w-full relative">
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
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(!!inputValue);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        // Hide suggestions immediately - selection via mousedown handles the add
                        setShowSuggestions(false);
                        addTag(); // Add tag on blur if there's text
                    }}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none focus:ring-0 p-1 text-dark-900 dark:text-dark-50 placeholder:text-dark-400 dark:placeholder:text-dark-500"
                    placeholder={value.length === 0 ? placeholder : ''}
                    disabled={disabled}
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isLoading ? (
                        <div className="p-2 text-center text-sm text-gray-500">Loading...</div>
                    ) : (
                        suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-dark-900 dark:text-dark-50 transition-colors"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    if (value.includes(suggestion)) return;
                                    onChange([...value, suggestion]);
                                    setInputValue('');
                                    setSuggestions([]);
                                    setShowSuggestions(false);
                                    // inputRef.current?.focus(); // Already focused since we prevented blur
                                }}
                            >
                                {suggestion}
                            </button>
                        ))
                    )}
                </div>
            )}

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
