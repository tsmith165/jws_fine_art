import React from 'react';
import PlacesAutocomplete, { Suggestion } from 'react-places-autocomplete';

interface InputAutoCompleteProps {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
}

const InputAutoComplete: React.FC<InputAutoCompleteProps> = ({ name, value, onChange }) => {
    return (
        <div className="m-0 flex w-full p-0">
            <PlacesAutocomplete value={value || ''} onChange={onChange}>
                {({ getInputProps, suggestions, getSuggestionItemProps }) => {
                    const inputProps: ReturnType<typeof getInputProps> = getInputProps({
                        placeholder: 'Enter Address...',
                        className:
                            'w-full h-8 px-2 text-secondary_dark bg-primary rounded-r-md border-none font-bold placeholder-secondary text-sm outline-none',
                        autoComplete: 'rutjfkde',
                        name,
                    });

                    return (
                        <div className="m-0 w-full p-0">
                            <div className="flex w-full">
                                <div className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5">
                                    <b className="text-primary">Address</b>
                                </div>
                                <input {...inputProps} />
                            </div>
                            <div className="w-full px-2.5 md:ml-[calc(20%+5px)] md:w-[calc(80%-20px)] ">
                                {suggestions.map((suggestion: Suggestion) => {
                                    const style = suggestion.active
                                        ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                    const suggestionItemProps: ReturnType<typeof getSuggestionItemProps> = getSuggestionItemProps(
                                        suggestion,
                                        'w-full h-8 px-2.5 py-1.5 text-secondary_dark bg-primary rounded-b-md border-none font-bold placeholder-secondary text-stone-900 overflow-hidden overflow-ellipsis whitespace-nowrap ',
                                    );
                                    return (
                                        <div
                                            className="h-8 overflow-hidden overflow-ellipsis whitespace-nowrap bg-primary px-3 text-secondary_dark last:rounded-b-md hover:bg-secondary_dark hover:text-primary"
                                            {...suggestionItemProps}
                                        >
                                            {suggestion.description}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }}
            </PlacesAutocomplete>
        </div>
    );
};

export default InputAutoComplete;
