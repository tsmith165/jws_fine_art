'use client';

import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { releaseDateLabel, releaseDateTimestamp } from '@shared/artworkRelease';

type OwnerDatePickerProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    describedBy?: string;
    invalid?: boolean;
    required?: boolean;
};

function localDate(value: string): Date | undefined {
    const timestamp = releaseDateTimestamp(value);
    if (!timestamp) return undefined;
    const date = new Date(timestamp);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function dateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function OwnerDatePicker({ id, value, onChange, describedBy, invalid, required }: OwnerDatePickerProps) {
    const [open, setOpen] = useState(false);
    const today = useMemo(() => new Date(), []);
    const selected = localDate(value);
    const timestamp = releaseDateTimestamp(value);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    id={id}
                    className="owner-date-picker-trigger"
                    type="button"
                    aria-describedby={describedBy}
                    data-invalid={invalid || undefined}
                    data-required={required || undefined}
                >
                    <CalendarDays size={17} aria-hidden="true" />
                    <span>
                        <strong>{timestamp ? releaseDateLabel(timestamp) : 'Choose release date'}</strong>
                        <small>{timestamp ? 'Public release date' : 'When collectors first saw this work'}</small>
                    </span>
                    <ChevronDown size={16} aria-hidden="true" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="owner-date-popover"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    collisionPadding={16}
                    aria-label="Choose artwork release date"
                >
                    <header>
                        <div>
                            <span>Release date</span>
                            <strong>{timestamp ? releaseDateLabel(timestamp) : 'Choose a date'}</strong>
                        </div>
                        <Popover.Close aria-label="Close release date picker">
                            <X size={16} />
                        </Popover.Close>
                    </header>
                    <DayPicker
                        mode="single"
                        selected={selected}
                        defaultMonth={selected ?? today}
                        onSelect={(date) => {
                            if (!date) return;
                            onChange(dateValue(date));
                            setOpen(false);
                        }}
                        disabled={{ after: today }}
                        startMonth={new Date(1960, 0, 1)}
                        endMonth={today}
                        captionLayout="dropdown"
                        navLayout="after"
                        reverseYears
                        showOutsideDays
                    />
                    <footer>
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            disabled={!value}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(dateValue(new Date()));
                                setOpen(false);
                            }}
                        >
                            Use today
                        </button>
                    </footer>
                    <Popover.Arrow className="owner-date-popover-arrow" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
