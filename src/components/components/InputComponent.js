import React from 'react';

import styles from '@/styles/components/InputComponent.module.scss';

import Tooltip from '@mui/material/Tooltip';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useLoadScript } from '@react-google-maps/api';
import PlacesAutocomplete from 'react-places-autocomplete';

import Select from 'react-select';

// INPUT TYPES
const INPUT_TYPE_MASTER = {
    'input_textbox': {name: "Input TextBox"},
    'input_datepicker': {name: "Input Datepicker"},
    'input_select': {name: "Input Select"},
    'input_multiselect': {name: "Input Select"},
    'input_textarea': {name: "Input Textarea"},
    'input_autocomplete': {name: "Input Autocomplete"},
}

class InputComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(`Creating Input Component with name: ${this.props.name}`)

        const input_type = this.props.input_type;
        var name = this.props.name;
        const full_name = (this.props.full_name !== undefined) ? (this.props.full_name) : (name);
        const id = (this.props.id !== undefined) ? (this.props.id) : name !== undefined ? (`${name.toLowerCase().replace(' ', '_')}`) : 'None';
        const split = this.props.split !== undefined ? this.props.split : false;
        const placeholder = this.props.placeholder !== undefined ? this.props.placeholder : '';
        const rows = this.props.rows !== undefined ? this.props.rows : 5;

        console.log(`---------------------------------------------------------`)
        console.log(`Generating ${INPUT_TYPE_MASTER[input_type].name} | Name: ${id} | Split: ${split}`)

        const class_name = split ? (styles.input_split_container) : (styles.input_full_container)
        if (input_type == 'input_textbox') {
            return (
                <div className={class_name}>
                    <Tooltip title={full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{name}</div>
                        </div>
                    </Tooltip>
                    <input 
                        id={id}
                        className={styles.input_textbox}
                        placeholder={placeholder}
                        value={this.props.value} 
                        onChange={(e) => {
                            e.preventDefault();
                            const changed_value = document.getElementById(id).value; 
                            console.log(`NEW VALUE FOR ${id}: ${changed_value}`); 
                            this.props.update_field_value(id, changed_value)
                        }
                    }/>
                </div>
            )
        }
        else if (input_type == 'input_textarea') {
            return (
                <div className={class_name}>
                    <Tooltip title={full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{name}</div>
                        </div>
                    </Tooltip>
                    <textarea 
                        id={id}
                        className={styles.input_textarea} 
                        value={this.props.value} 
                        rows={rows}
                        onChange={(e) => {
                            e.preventDefault();
                            var changed_value = document.getElementById(id).value;
                            changed_value = changed_value.split('<br>').join('\n');
                            console.log(`NEW VALUE FOR ${id}: ${changed_value}`); 
                            this.props.update_field_value(id, changed_value)
                        }
                    }/>
                </div>
            )
        }
        else if (input_type === 'input_select') {
            console.log(`Possible Select Options (Next Line):`);
            console.log(this.props.select_options)

            const react_select_options = this.props.select_options.map(option => ({ value: option[0], label: option[1] }));
            console.log(`React Select Formatted Options (Next Line):`);
            console.log(react_select_options)

            console.log(`Selected Option type: ${(typeof this.props.value)} | Value: ${this.props.value}`)
        
            return (
                <div className={class_name}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>{name}</div>
                    </div>
                    <Select
                        value={{name: this.props.value, label: this.props.value}}
                        isMulti={false}
                        id={id}
                        name={id}
                        className={`${styles.input_select}`}
                        classNamePrefix="select"
                        onChange={(new_selected_options) =>
                            this.props.update_field_value(id, new_selected_options)
                        }
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: '',
                                backgroundColor: '#45544d',
                            }),
                        }}
                        options={react_select_options}
                    />
                </div>
            );
        }
        else if (input_type === 'input_multiselect') {
            console.log(`Possible Multi-Select Options (Next Line):`);
            console.log(this.props.select_options)

            const react_select_options = this.props.select_options.map(option => ({ value: option[0], label: option[1] }));
            console.log(`React Multi-Select Options (Next Line):`);
            console.log(react_select_options)

            console.log(`Selected Options (Next Line):`);
            console.log(this.props.value);
        
            return (
                <div className={class_name}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>{name}</div>
                    </div>
                    <Select
                        value={this.props.value}
                        isMulti={true}
                        id={id}
                        name={id}
                        className={`${styles.input_select}`}
                        classNamePrefix="select"
                        onChange={(new_selected_options) =>
                            this.props.handle_multi_select_change(new_selected_options)
                        }
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: '',
                                backgroundColor: '#45544d',
                            }),
                        }}
                        options={react_select_options}
                    />
                </div>
            );
        }
        else if (input_type == 'input_datepicker') {
            return (
                <div className={class_name}>
                    <Tooltip title={full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{name}</div>
                        </div>
                    </Tooltip>
                    <DatePicker
                        id={id}
                        className={styles.date_picker}
                        selected={this.props.state.date} 
                        onChange= { (date) => {
                            console.log(`NEW DATE SELECTED: ${date}`); 
                            this.props.update_field_value(id, date)
                            }
                        } 
                    />
                </div>
            )
        }
        else if (input_type == 'input_autocomplete') {
            return (
                <div className={class_name}>
                    <PlacesAutocomplete value={this.props.value} onChange={this.props.address_change} onSelect={this.props.address_change}>
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div className={styles.autocomplete_container}>
                                <div className={styles.input_container_autocomplete}>
                                    <div className={styles.input_label_container}>
                                        <b className={styles.input_label}>Address</b>
                                    </div>
                                    <input
                                        {...getInputProps({
                                            placeholder: 'Enter Address...',
                                            className: `${styles.input_autocomplete}`,
                                            autoComplete: 'rutjfkde',
                                        })}
                                    />
                                </div>
                                <div className={styles.autocomplete_dropdown_container}>
                                    {suggestions.map((suggestion) => {
                                        // inline style for demonstration purpose
                                        const style = suggestion.active
                                            ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                        return (
                                            <div
                                                key={suggestion.placeId}
                                                className={styles.input_suggestion}
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
            )
        }
    }
}

function useGoogleMapsLoader() {
    return useLoadScript({
        googleMapsApiKey: 'AIzaSyAQTCNGxtlglxAOC-CjqhKc2nroYKmPS7s',
        libraries: ['places'],
    });
}

function withLoadScript(WrappedComponent) {
    return function (props) {
        const { isLoaded, loadError } = useGoogleMapsLoader();

        if (loadError) {
            return <div>Error loading Google Maps API: {loadError.message}</div>;
        }

        if (!isLoaded) {
            return <div>Loading Google Maps API...</div>;
        }

        return <WrappedComponent {...props} />;
    };
}

export default withLoadScript(InputComponent);