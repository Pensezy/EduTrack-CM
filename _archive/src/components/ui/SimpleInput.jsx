import React from 'react';
import { cn } from '../../utils/cn';

const SimpleInput = React.forwardRef(({
    className = '',
    type = "text",
    label,
    error,
    required = false,
    id,
    ...props
}, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "text-sm font-medium leading-none",
                        error ? "text-red-600" : "text-gray-900"
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
});

SimpleInput.displayName = "SimpleInput";

export default SimpleInput;