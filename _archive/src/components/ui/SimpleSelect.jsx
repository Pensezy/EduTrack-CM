import React, { useState } from 'react';
import { cn } from '../../utils/cn';

const SimpleSelect = React.forwardRef(({
    className = '',
    options = [],
    value,
    placeholder = "Select an option",
    disabled = false,
    required = false,
    label,
    error,
    onChange,
    ...props
}, ref) => {
    const handleChange = (e) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className={cn(
                    "text-sm font-medium leading-none",
                    error ? "text-red-600" : "text-gray-900"
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                    className
                )}
                value={value || ''}
                onChange={handleChange}
                disabled={disabled}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
});

SimpleSelect.displayName = "SimpleSelect";

export default SimpleSelect;