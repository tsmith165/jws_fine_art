import React from 'react';
import eventsData, { ArtistEvent } from '@/lib/events_data';

export default function Events() {
    return (
        <div className="flex flex-col space-y-8 p-4">
            <h1 className="bg-gradient-to-r from-primary via-primary_dark to-primary bg-clip-text text-center text-4xl font-bold text-transparent">
                Events
            </h1>
            {eventsData.map((event, index) => (
                <EventItem key={index} event={event} />
            ))}
        </div>
    );
}

function EventItem({ event }: { event: ArtistEvent }) {
    return (
        <div className="rounded-lg border border-gray-300 p-4">
            <h2 className="mb-2 text-xl font-semibold">{event.title}</h2>
            <p className="mb-2 text-gray-600">
                {event.startDate} - {event.endDate}
            </p>
            <p className="mb-2 text-gray-600">{event.location}</p>
            <p>{event.description}</p>
            {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                    Learn More
                </a>
            )}
        </div>
    );
}
