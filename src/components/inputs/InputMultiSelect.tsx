'use client';

import React from 'react';
import Select, { components, StylesConfig, ControlProps, MultiValueProps, OptionProps, GroupBase } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';

interface InputMultiSelectProps {
    idName: string;
    defaultValue?: { value: string; label: string }[];
    name: string;
    select_options: [string, string][];
    onChange?: (selectedOptions: { value: string; label: string }[]) => void;
    inputId?: string;
}

interface OptionType {
    value: string;
    label: string;
}

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({ idName, defaultValue, name, select_options, onChange, inputId }) => {
    const id = inputId;
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    const customStyles: StylesConfig<OptionType, true> = {
        control: (baseStyles: any) => ({
            ...baseStyles,
            borderColor: '',
            backgroundColor: 'var(--tw-bg-stone-400)',
        }),
        multiValue: (styles: any) => ({
            ...styles,
            backgroundColor: 'var(--color-secondary-dark)',
        }),
        option: (provided: any) => ({
            ...provided,
            color: 'var(--color-stone-950)',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: 'var(--color-stone-300)',
        }),
    };

    return (
        <div className="m-0 flex w-full p-0">
            <div className="flex min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5">
                <div className="font-semibold text-stone-400">{name}</div>
            </div>
            <Select<OptionType, true>
                defaultValue={defaultValue}
                isMulti={true}
                id={idName}
                name={idName}
                className="h-full flex-grow rounded-r-md border-none bg-stone-400 text-sm font-bold text-secondary_dark"
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={customStyles}
                options={react_select_options}
                onChange={(selectedOptions: { value: string; label: string }[]) => {
                    if (onChange && selectedOptions) {
                        onChange(selectedOptions as { value: string; label: string }[]);
                    }
                }}
            />
        </div>
    );
};

export default InputMultiSelect;
