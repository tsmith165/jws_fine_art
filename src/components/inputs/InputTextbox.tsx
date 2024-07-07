'use client';

import React, { useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextboxProps {
    idName: string;
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextbox: React.FC<InputTextboxProps> = ({ idName, name, value, placeholder, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const prevValueRef = useRef<string | undefined>(value);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            // console.log(`InputTextbox ${idName} value changed from ${prevValueRef.current} to ${value}`);
            prevValueRef.current = value;
            if (inputRef.current && !onChange) {
                inputRef.current.value = value || '';
            }
        }
    }, [idName, value, onChange]);

    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex h-full w-full max-w-full flex-row overflow-hidden p-0">
            <div
                className="flex h-8 min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="font-bold text-stone-400">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <input
                ref={inputRef}
                id={idName}
                name={idName}
                className="flex h-8 w-full rounded-r-md border-none bg-stone-400 px-2 text-sm font-bold text-stone-950 placeholder-stone-700"
                value={onChange ? value : undefined}
                defaultValue={!onChange ? value : undefined}
                placeholder={placeholder || ''}
                onChange={onChange}
            />
        </div>
    );
};

export default InputTextbox;
