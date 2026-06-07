export const playlistCardsData = [
    {
        catalog: 'Edição 001',
        artist: 'SNOT - CONCRETICIDADE',
        song: 'Playlist / Dubstep',
        image: 'playlist/snot/WhatsApp%20Image%202026-06-04%20at%2017.48.49.jpeg',
        slug: 'concreticidade'
    },
    {
        catalog: 'Edição 002',
        artist: 'BLACKMESA - BOOTLEGS I',
        song: 'Release / UK Bass / Dubstep',
        image: 'https://f4.bcbits.com/img/a2622922340_10.jpg',
        slug: 'bootlegs-i'
    }
];

export type PlaylistCard = typeof playlistCardsData[number];
