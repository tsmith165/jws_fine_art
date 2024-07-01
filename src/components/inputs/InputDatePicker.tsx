'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface InputDatePickerProps {
    defaultValue?: Date;
    name: string;
}

const InputDatePicker: React.FC<InputDatePickerProps> = ({ defaultValue, name }) => {
    const id = name.toLowerCase().replace(' ', '_');
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex h-8 min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5"
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-stone-400 font-semibold">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${id}`} place="top" />
            <DatePicker
                id={id}
                className="h-8 rounded-r-md border-none bg-stone-400 px-2.5 text-sm font-bold text-secondary_dark"
                selected={defaultValue}
                onChange={() => {}} // Add this line
            />
        </div>
    );
};

export default InputDatePicker;
