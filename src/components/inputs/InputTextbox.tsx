'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextboxProps {
    idName: string;
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextbox: React.FC<InputTextboxProps> = ({ idName, name, value, placeholder, onChange }) => {
    return (
        <div className="m-0 flex h-full w-full max-w-full flex-row overflow-hidden p-0">
            <div
                className="flex h-8 min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={name}
            >
                <div className="text-stone-400 font-semibold">{name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            {onChange ? (
                <input
                    id={idName}
                    name={idName}
                    className="flex h-8 w-full rounded-r-md border-none bg-stone-400 px-2 text-sm font-bold text-secondary_dark placeholder-secondary outline-none"
                    value={value}
                    placeholder={placeholder || ''}
                    onChange={onChange}
                />
            ) : (
                <input
                    id={idName}
                    name={idName}
                    className="flex h-8 w-full rounded-r-md border-none bg-stone-400 px-2 text-sm font-bold text-secondary_dark placeholder-secondary outline-none"
                    defaultValue={value}
                    placeholder={placeholder || ''}
                />
            )}
        </div>
    );
};

export default InputTextbox;
