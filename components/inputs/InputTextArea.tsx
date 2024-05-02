'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextAreaProps {
    defaultValue?: string;
    name: string;
    rows: number;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({ defaultValue, name, rows }) => {
    const id = name.toLowerCase().replace(' ', '_');
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold"
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-primary">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${id}`} place="top" />
            <textarea
                id={id}
                className="h-full w-full whitespace-pre-wrap rounded-r-md border-none bg-primary py-1.5 pl-2.5 text-sm font-bold text-secondary_dark"
                defaultValue={defaultValue}
                rows={rows}
            />
        </div>
    );
};

export default InputTextArea;
