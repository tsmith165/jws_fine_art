// /components/wrappers/InputComponent.jsx
import logger from '@/lib/logger';

import React from 'react';

import { Tooltip } from 'react-tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import PlacesAutocomplete from 'react-places-autocomplete';

import Select, { components } from 'react-select';
import { IoMdArrowDropdown } from 'react-icons/io';

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <IoMdArrowDropdown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

// INPUT TYPES
const INPUT_TYPE_MASTER = {
    input_textbox: { name: 'Input TextBox' },
    input_datepicker: { name: 'Input Datepicker' },
    input_select: { name: 'Input Select' },
    input_multiselect: { name: 'Input Select' },
    input_textarea: { name: 'Input Textarea' },
    input_autocomplete: { name: 'Input Autocomplete' },
    input_file: { name: 'Input File' },
};

class InputComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var name = this.props.name;
        const full_name = this.props.full_name !== undefined ? this.props.full_name : name;
        const id = this.props.id !== undefined ? this.props.id : name !== undefined ? `${name.toLowerCase().replace(' ', '_')}` : 'None';
        const split = this.props.split !== undefined ? this.props.split : false;
        const placeholder = this.props.placeholder !== undefined ? this.props.placeholder : '';
        const rows = this.props.rows !== undefined ? this.props.rows : 5;

        const input_type = this.props.input_type;
        logger.extra(`Generating ${INPUT_TYPE_MASTER[input_type].name} | Name: ${id} | Split: ${split}`);

        const renderInput = {
            input_textbox: () => {
                return (
                    <div className={split ? 'flex w-[calc(50%-40px)] flex-row' : 'm-0 flex w-full p-0'}>
                        <Tooltip title={full_name} placement="top-start">
                            <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold">
                                <div className="text-primary">{name}</div>
                            </div>
                        </Tooltip>
                        <input
                            id={id}
                            className="flex h-full flex-shrink rounded-r-md border-none bg-primary text-sm font-bold text-secondary_dark  placeholder-secondary"
                            placeholder={placeholder}
                            value={this.props.value}
                            onChange={(e) => {
                                e.preventDefault();
                                const changed_value = document.getElementById(id).value;
                                console.log(`NEW VALUE FOR ${id}: ${changed_value}`);
                                this.props.update_field_value(id, changed_value);
                            }}
                        />
                    </div>
                );
            },
            input_textarea: () => {
                return (
                    <div className={split ? 'flex w-1/2 flex-row' : 'm-0 flex w-full p-0'}>
                        <Tooltip title={full_name} placement="top-start">
                            <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold">
                                <div className="text-primary">{name}</div>
                            </div>
                        </Tooltip>
                        <textarea
                            id={id}
                            className="h-full flex-grow rounded-r-md border-none bg-primary px-2.5 py-1.5 text-sm font-bold text-secondary_dark"
                            value={this.props.value}
                            rows={rows}
                            onChange={(e) => {
                                e.preventDefault();
                                var changed_value = document.getElementById(id).value;
                                changed_value = changed_value.split('<br>').join('\n');
                                console.log(`NEW VALUE FOR ${id}: ${changed_value}`);
                                this.props.update_field_value(id, changed_value);
                            }}
                        />
                    </div>
                );
            },
            input_select: () => {
                const react_select_options = this.props.select_options.map((option) => ({ value: option[0], label: option[1] }));

                return (
                    <div className={split ? 'flex w-1/2 flex-row' : 'm-0 flex w-full p-0'}>
                        <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 text-secondary_light">
                            <div className="text-primary">{name}</div>
                        </div>
                        <Select
                            value={{ name: this.props.value, label: this.props.value }}
                            isMulti={false}
                            id={id}
                            name={id}
                            className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold  text-secondary_dark "
                            classNamePrefix="select"
                            onChange={(new_selected_options) => this.props.update_field_value(id, new_selected_options)}
                            components={{
                                DropdownIndicator,
                            }}
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    borderColor: '',
                                    backgroundColor: '#54786d',
                                }),
                                singleValue: (provided, state) => ({
                                    ...provided,
                                    color: '#365349',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    color: '#616c63',
                                }),
                            }}
                            options={react_select_options}
                        />
                    </div>
                );
            },
            input_multiselect: () => {
                const react_select_options = this.props.select_options.map((option) => ({ value: option[0], label: option[1] }));

                return (
                    <div className={split ? 'flex w-1/2 flex-row' : 'm-0 flex w-full p-0'}>
                        <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 text-secondary_light">
                            <div className="text-primary">{name}</div>
                        </div>
                        <Select
                            value={this.props.value}
                            isMulti={true}
                            id={id}
                            name={id}
                            className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-secondary_dark"
                            classNamePrefix="select"
                            onChange={(new_selected_options) => this.props.handle_multi_select_change(new_selected_options)}
                            components={{
                                DropdownIndicator,
                            }}
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    borderColor: '',
                                    backgroundColor: '#54786d',
                                }),
                                multiValue: (styles) => ({
                                    ...styles,
                                    backgroundColor: '#365349',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    color: '#616c63',
                                }),
                            }}
                            options={react_select_options}
                        />
                    </div>
                );
            },
            input_datepicker: () => {
                return (
                    <div className={split ? 'flex w-1/2 flex-row' : 'm-0 flex w-full p-0'}>
                        <Tooltip title={full_name} placement="top-start">
                            <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold">
                                <div className="text-primary">{name}</div>
                            </div>
                        </Tooltip>
                        <DatePicker
                            id={id}
                            className="h-full rounded-r-md border-none bg-primary px-2.5 py-1.5 text-sm font-bold text-secondary_dark"
                            selected={this.props.state.date}
                            onChange={(date) => {
                                console.log(`NEW DATE SELECTED: ${date}`);
                                this.props.update_field_value(id, date);
                            }}
                        />
                    </div>
                );
            },
            input_autocomplete: () => {
                return (
                    <div className={split ? 'flex w-1/2 flex-row' : 'm-0 flex w-full p-0'}>
                        <PlacesAutocomplete
                            value={this.props.value}
                            onChange={this.props.address_change}
                            onSelect={this.props.address_change}
                        >
                            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div className="m-0 w-full p-0">
                                    <div className="flex w-full">
                                        <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold">
                                            <b className="text-primary">Address</b>
                                        </div>
                                        <input
                                            {...getInputProps({
                                                placeholder: 'Enter Address...',
                                                className:
                                                    'w-[70%] h-full px-2.5 py-1.5 text-secondary_dark bg-primary rounded-r-md border-none pl-1.5 font-bold placeholder-secondary',
                                                autoComplete: 'rutjfkde',
                                            })}
                                        />
                                    </div>
                                    <div className="ml-[calc(30%+5px)] w-[calc(70%-20px)]">
                                        {suggestions.map((suggestion) => {
                                            const style = suggestion.active
                                                ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                            return (
                                                <div
                                                    key={suggestion.placeId}
                                                    className="bg-primary px-2.5 pt-2.5 text-secondary_dark last:rounded-bl-md last:rounded-br-md last:pb-2.5"
                                                    {...getSuggestionItemProps(suggestion, { style })}
                                                >
                                                    {suggestion.description}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </PlacesAutocomplete>
                    </div>
                );
            },
            input_file: () => {
                return (
                    <div className={split ? 'flex w-1/2 flex-row md:w-full' : 'm-0 flex w-full flex-row p-0'}>
                        {/* Input Label */}
                        <Tooltip title={full_name} placement="top-start">
                            <div className="flex items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold">
                                <div className="text-primary">{name}</div>
                            </div>
                        </Tooltip>

                        {/* File Type Select */}
                        <div className="flex flex-grow flex-row space-x-2 rounded-r-lg border-4 border-r-0 border-secondary_dark bg-secondary_dark">
                            <Select
                                value={{ name: this.props.file_upload_type, label: this.props.file_upload_type }}
                                isMulti={false}
                                id={`$upload_type`}
                                name={`$upload_type`}
                                className="m-0 w-full rounded-none border-none bg-primary text-sm text-secondary_dark"
                                classNamePrefix="select"
                                onChange={(new_selected_option) => {
                                    console.log(`NEW FILE TYPE SELECTED: ${new_selected_option}`);
                                    this.props.update_field_value('file_upload_type', new_selected_option);
                                }}
                                styles={{
                                    control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        borderColor: '',
                                        backgroundColor: '#54786d',
                                    }),
                                }}
                                options={this.props.file_types}
                            />

                            {/* Select File Button */}
                            <button
                                className="inline-block w-fit grow cursor-pointer whitespace-nowrap rounded-md border-none bg-secondary_dark px-4 py-1 text-center font-lato text-sm font-bold text-primary no-underline hover:bg-secondary_light hover:text-secondary_dark"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(id).click();
                                }}
                            >
                                Select File
                            </button>

                            {/* File Input (Not Displayed) */}
                            <input
                                id={id}
                                type="file"
                                className="hidden"
                                onChange={(event) => {
                                    this.props.onFileChange(event);
                                }}
                            />

                            {/* File Path Textbox (Read Only) */}
                            <input
                                id={`${id}_path`}
                                type="text"
                                readOnly
                                className="m-0 !mr-1 w-full grow rounded-br-md rounded-tr-md border-none bg-primary px-3 py-1 font-lato text-sm text-secondary_dark placeholder-secondary_dark placeholder-opacity-100"
                                placeholder="Click Select File & choose image..."
                                value={this.props.uploaded_image_path}
                            />
                        </div>
                    </div>
                );
            },
        };

        return renderInput[input_type]();
    }
}

export default InputComponent;
