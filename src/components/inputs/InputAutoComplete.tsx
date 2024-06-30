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
                            'w-fit flex-grow flex h-8 px-2 text-secondary_dark bg-primary rounded-r-md border-none font-bold placeholder-secondary text-sm outline-none',
                        name,
                    });

                    return (
                        <div className="m-0 w-full max-w-full p-0">
                            <div className="flex w-full">
                                <div className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5">
                                    <b className="text-primary">Address</b>
                                </div>
                                <input {...inputProps} />
                            </div>
                            <div className="m-auto w-[calc(100vw-40px)] px-2.5 md:w-[calc(100%-40px)] ">
                                {suggestions.map((suggestion: Suggestion) => {
                                    const style = suggestion.active
                                        ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                    const suggestionItemProps: ReturnType<typeof getSuggestionItemProps> = getSuggestionItemProps(
                                        suggestion,
                                        'h-8 px-2.5 py-1.5 text-secondary_dark bg-primary rounded-b-md border-none font-bold placeholder-secondary text-stone-900 overflow-hidden overflow-ellipsis whitespace-nowrap ',
                                    );
                                    return (
                                        <div
                                            className="h-8 overflow-hidden overflow-ellipsis whitespace-nowrap bg-primary px-2.5 text-secondary_dark last:rounded-b-md hover:bg-secondary_dark hover:text-primary"
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
