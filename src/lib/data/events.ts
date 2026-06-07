export interface EventData {
    catalog: string;
    artist: string;
    song: string;
    image: string;
    link: string;
    location?: string;
}

export const eventsData: EventData[] = [
    {
        catalog: '05.06.2026',
        artist: 'VILELA BADAY',
        song: 'CR1A',
        image: 'flyers/18.webp',
        link: 'https://www.instagram.com/p/DYxwEdlkVhV/',
        location: 'R. São Domingos, 251 - Bela Vista, São Paulo'
    }
];

for (let i = 17; i >= 1; i--) {
    eventsData.push({
        catalog: 'TBA',
        artist: `ARTISTA ${i}`,
        song: `EVENTO ${i}`,
        image: `flyers/${i}.webp`,
        link: '#'
    });
}
