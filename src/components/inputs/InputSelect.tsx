import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

interface InputSelectProps {
    defaultValue?: { value: string; label: string };
    idName: string;
    name: string;
    select_options: [string, string][];
    value?: string | boolean;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const InputSelect: React.FC<InputSelectProps> = ({ defaultValue, idName, name, select_options, value, onChange }) => {
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    const handleChange = (selectedOption: any) => {
        if (onChange) {
            let newValue = selectedOption.value;
            // Convert 'True' and 'False' strings to boolean if necessary
            if (newValue === 'True') newValue = true;
            if (newValue === 'False') newValue = false;

            const syntheticEvent = {
                target: {
                    name: idName,
                    value: newValue,
                },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
        }
    };

    // Convert boolean value to string for Select component
    const selectValue = typeof value === 'boolean' ? (value ? 'True' : 'False') : value;

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="font-bold text-stone-400">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <Select
                defaultValue={defaultValue}
                value={react_select_options.find((option) => option.value === selectValue)}
                isMulti={false}
                id={idName}
                name={idName}
                className="h-full flex-grow rounded-r-md border-none bg-stone-400 text-sm font-bold text-stone-950"
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: '',
                        backgroundColor: 'var(--tw-bg-stone-400)',
                    }),
                }}
                options={react_select_options}
                onChange={handleChange}
            />
        </div>
    );
};

export default InputSelect;
