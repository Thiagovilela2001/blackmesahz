export const playlistCardsData = [
    {
        catalog: 'Piloto',
        artist: 'BLACKMESA Hz - PILOTO',
        song: 'Playlist / UK Garage',
        image: 'playlist/piloto/1.%20FRENTE.png',
        slug: 'piloto'
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
