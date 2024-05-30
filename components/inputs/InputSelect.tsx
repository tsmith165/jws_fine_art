'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

interface InputSelectProps {
    defaultValue?: { value: string; label: string };
    name: string;
    select_options: [string, string][];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    inputId?: string; // Added inputId prop
}

const InputSelect: React.FC<InputSelectProps> = ({ defaultValue, name, select_options, value, onChange, inputId }) => {
    const id = inputId || uuidv4();
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    return (
        <div className="m-0 flex w-full p-0">
            <div className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 text-secondary_light">
                <div className="text-primary">{formatted_name}</div>
            </div>
            {onChange === undefined ? (
                <Select
                    defaultValue={defaultValue}
                    value={react_select_options.find((option) => option.value === value)}
                    isMulti={false}
                    id={id}
                    name={id}
                    className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-secondary_dark"
                    classNamePrefix="select"
                    components={{
                        DropdownIndicator,
                    }}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: '',
                            backgroundColor: '#54786d',
                        }),
                    }}
                    options={react_select_options}
                />
            ) : (
                <Select
                    defaultValue={defaultValue}
                    value={react_select_options.find((option) => option.value === value)}
                    isMulti={false}
                    id={id}
                    name={id}
                    className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-secondary_dark"
                    classNamePrefix="select"
                    components={{
                        DropdownIndicator,
                    }}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: '',
                            backgroundColor: '#54786d',
                        }),
                    }}
                    options={react_select_options}
                    onChange={(selectedOption) =>
                        onChange?.({ target: { value: selectedOption?.value, name: id } } as React.ChangeEvent<HTMLSelectElement>)
                    }
                />
            )}
        </div>
    );
};

export default InputSelect;
