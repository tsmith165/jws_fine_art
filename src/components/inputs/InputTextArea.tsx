'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextAreaProps {
    idName: string;
    name: string;
    rows: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({ idName, name, rows, value, onChange }) => {
    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={name}
            >
                <div className="text-stone-400 font-semibold">{name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <textarea
                id={idName}
                name={idName}
                className="h-full w-full whitespace-pre-wrap rounded-r-md border-none bg-stone-400 py-1.5 pl-2.5 text-sm font-bold text-secondary_dark outline-none"
                value={value}
                rows={rows}
                onChange={onChange}
            />
        </div>
    );
};

export default InputTextArea;
