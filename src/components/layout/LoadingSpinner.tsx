import React from 'react';

interface LoadingSpinnerProps {
    page?: string;
}

const LoadingSpinner = ({ page }: LoadingSpinnerProps) => {
    return (
        <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary_dark to-secondary">
                <div className="h-7 w-7 rounded-full bg-secondary_dark opacity-75"></div>
            </div>
            <span className="text-2xl text-primary">{page === '' ? 'Loading...' : `Entering ${page}...`}</span>
        </div>
    );
};

export default LoadingSpinner;
