'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextboxProps {
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextbox: React.FC<InputTextboxProps> = ({ name, value, placeholder, onChange }) => {
    const id = name.toLowerCase().replace(' ', '_');
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex h-full w-full max-w-full flex-row overflow-hidden p-0">
            <div
                className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 font-semibold"
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-primary">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${id}`} place="top" />
            {onChange ? (
                <input
                    id={id}
                    name={id}
                    className="flex h-8 w-full rounded-r-md border-none bg-primary px-2 text-sm font-bold text-secondary_dark placeholder-secondary"
                    value={value}
                    placeholder={placeholder || ''}
                    onChange={onChange}
                />
            ) : (
                <input
                    id={id}
                    name={id}
                    className="flex h-8 w-full rounded-r-md border-none bg-primary px-2 text-sm font-bold text-secondary_dark placeholder-secondary"
                    defaultValue={value}
                    placeholder={placeholder || ''}
                />
            )}
        </div>
    );
};

export default InputTextbox;
