import React from 'react';import React from 'react';import React from 'react';import React from 'react';import React from 'react';

import { cn } from '../../utils/cn';

import { cn } from '../../utils/cn';

const SimpleButton = React.forwardRef(({

    className = '',import Icon from '../AppIcon';

    variant = 'default',

    size = 'default',const SimpleButton = React.forwardRef(({

    children,

    loading = false,    className = '',import { cn } from '../../utils/cn';import Icon from '../AppIcon';import Icon from '../AppIcon';

    disabled = false,

    ...props    variant = 'default',

}, ref) => {

    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";    size = 'default',

    

    const variantClasses = {    children,

        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",    loading = false,const SimpleButton = React.forwardRef(({import { cn } from '../../utils/cn';import { cn } from '../../utils/cn';eact from 'react';

        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",

        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"    disabled = false,

    };

        ...props    className = '',

    const sizeClasses = {

        sm: "h-8 px-3 text-sm",}, ref) => {

        default: "h-10 px-4 py-2 text-sm",

        lg: "h-11 px-8 text-base"    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";    variant = 'default',imp    const LoadingSpinner = () => (

    };

    

    const LoadingSpinner = () => (

        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">    const variantClasses = {    size = 'default',

            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

        </svg>

    );        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",    children,const SimpleButton = React.forwardRef(({        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">



    return (        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",

        <button

            className={cn(        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"    loading = false,

                baseClasses,

                variantClasses[variant] || variantClasses.default,    };

                sizeClasses[size] || sizeClasses.default,

                className        disabled = false,    className = '',            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

            )}

            ref={ref}    const sizeClasses = {

            disabled={disabled || loading}

            {...props}        sm: "h-8 px-3 text-sm",    ...props

        >

            {loading && <LoadingSpinner />}        default: "h-10 px-4 py-2 text-sm",

            {children}

        </button>        lg: "h-11 px-8 text-base"}, ref) => {    variant = 'default',            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

    );

});    };



SimpleButton.displayName = "SimpleButton";    // Base button classes



export default SimpleButton;    const LoadingSpinner = () => (

        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";    size = 'default',        </svg>

            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />    

        </svg>

    );    // Variant classes    children,    );on from '../AppIcon';



    return (    const variantClasses = {

        <button

            className={cn(        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",    loading = false,import { cn } from '../../utils/cn';

                baseClasses,

                variantClasses[variant] || variantClasses.default,        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",

                sizeClasses[size] || sizeClasses.default,

                className        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",    disabled = false,

            )}

            ref={ref}        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"

            disabled={disabled || loading}

            {...props}    };    ...propsconst SimpleButton = React.forwardRef(({

        >

            {loading && <LoadingSpinner />}    

            {children}

        </button>    // Size classes}, ref) => {    className = '',

    );

});    const sizeClasses = {



SimpleButton.displayName = "SimpleButton";        sm: "h-8 px-3 text-sm",    // Base button classes    variant = 'default',



export default SimpleButton;        default: "h-10 px-4 py-2 text-sm",

        lg: "h-11 px-8 text-base"    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";    size = 'default',

    };

        children,

    const LoadingSpinner = () => (

        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">    // Variant classes    loading = false,

            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />    const variantClasses = {    disabled = false,

        </svg>

    );        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",    ...props



    return (        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",}, ref) => {

        <button

            className={cn(        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",    // Base button classes

                baseClasses,

                variantClasses[variant] || variantClasses.default,        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

                sizeClasses[size] || sizeClasses.default,

                className    };    

            )}

            ref={ref}        // Variant classes

            disabled={disabled || loading}

            {...props}    // Size classes    const variantClasses = {

        >

            {loading && <LoadingSpinner />}    const sizeClasses = {        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

            {children}

        </button>        sm: "h-8 px-3 text-sm",        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",

    );

});        default: "h-10 px-4 py-2 text-sm",        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",



SimpleButton.displayName = "SimpleButton";        lg: "h-11 px-8 text-base"        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"



export default SimpleButton;    };    };

    

    const LoadingSpinner = () => (    // Size classes

        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">    const sizeClasses = {

            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />        sm: "h-8 px-3 text-sm",

            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />        default: "h-10 px-4 py-2 text-sm",

        </svg>        lg: "h-11 px-8 text-base"

    );    };



    return (    const LoadingSpinner = () => (

        <button        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">

            className={cn(            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

                baseClasses,            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

                variantClasses[variant] || variantClasses.default,        </svg>

                sizeClasses[size] || sizeClasses.default,    );

                className

            )}    return (

            ref={ref}        <button

            disabled={disabled || loading}            className={cn(

            {...props}                baseClasses,

        >                variantClasses[variant] || variantClasses.default,

            {loading && <LoadingSpinner />}                sizeClasses[size] || sizeClasses.default,

            {children}                className

        </button>            )}

    );            ref={ref}

});            disabled={disabled || loading}

            {...props}

SimpleButton.displayName = "SimpleButton";        >

            {loading && <LoadingSpinner />}

export default SimpleButton;            {children}
        </button>
    );
});

SimpleButton.displayName = "SimpleButton";

export default SimpleButton;