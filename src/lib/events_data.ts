interface ArtistEvent {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    link?: string;
}

export type { ArtistEvent };

const eventsData: ArtistEvent[] = [
    {
        title: 'Art Show 1',
        startDate: 'June 1, 2023',
        endDate: 'June 5, 2023',
        location: 'Gallery A',
        description: 'Join us for an exciting art show featuring the works of Jill Weeks Smith.',
        link: 'https://example.com/artshow1',
    },
    {
        title: 'Art Festival',
        startDate: 'July 15, 2023',
        endDate: 'July 20, 2023',
        location: 'City Park',
        description: 'Experience a vibrant art festival with various artists, including Jill Weeks Smith.',
    },
];

export default eventsData;
