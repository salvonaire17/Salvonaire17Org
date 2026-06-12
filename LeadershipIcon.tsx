
import React from 'react';

interface IconProps {
    children: React.ReactNode;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ children, className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className || "h-6 w-6"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            {children}
        </svg>
    );
};
