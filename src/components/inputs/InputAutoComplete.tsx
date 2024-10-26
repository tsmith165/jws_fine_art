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
                            'w-fit flex-grow flex h-8 px-2 text-secondary_dark bg-stone-400 rounded-r-md border-none font-bold placeholder-secondary text-sm outline-none',
                        name,
                    });

                    return (
                        <div className="m-0 w-full max-w-full p-0">
                            <div className="flex w-full">
                                <div className="flex h-8 min-w-32 max-w-32 items-center justify-center rounded-l-md bg-secondary_dark px-2.5">
                                    <b className="text-stone-400 font-semibold">Address</b>
                                </div>
                                <input {...inputProps} />
                            </div>
                            <div className="m-auto flex w-[calc(100vw-40px)] flex-col px-2.5 md:w-[calc(100%-40px)]">
                                {suggestions.map((suggestion: Suggestion) => {
                                    const style = suggestion.active
                                        ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                    const suggestionItemProps: ReturnType<typeof getSuggestionItemProps> = getSuggestionItemProps(
                                        suggestion,
                                        'h-8 px-2.5 text-secondary_dark bg-stone-400 rounded-b-md border-none font-bold placeholder-secondary text-stone-900 overflow-hidden overflow-ellipsis whitespace-nowrap ',
                                    );
                                    return (
                                        <div
                                            className="h-8 overflow-hidden overflow-ellipsis whitespace-nowrap bg-stone-400 px-2.5 py-0.5 leading-8 text-primary_dark last:rounded-b-md last:pb-1 hover:bg-secondary_dark hover:text-primary"
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
