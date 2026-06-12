const configuredStreamUrl = import.meta.env.PUBLIC_RADIO_STREAM_URL || 'http://127.0.0.1:8000/blackmesa.mp3';

export type RadioTrack = {
    title: string;
    artist: string;
    src: string;
    artwork?: string;
    genre?: string;
    release?: string;
};

export type RadioShow = {
    date: string;
    title: string;
    description: string;
    host?: string;
    time_slot?: string;
    genre?: string;
    image?: string;
};

export type RadioScheduleRow = {
    time: string;
    shows: string[];
};

export type RadioData = {
    mode: 'live' | 'archive';
    streamUrl: string;
    station: string;
    location: string;
    currentShow: {
        label: string;
        series: string;
        title: string;
        description: string;
        host: string;
    };
    liveTrack: RadioTrack;
    tracks: RadioTrack[];
    tags: string[];
    next: Array<{ time: string; title: string; subtitle: string }>;
    highlights: RadioShow[];
    scheduleDays: string[];
    schedule: RadioScheduleRow[];
};

export const radioData: RadioData = {
    mode: 'live',
    streamUrl: configuredStreamUrl,
    station: 'BLACKMESA Hz',
    location: 'São Paulo / Online',
    currentShow: {
        label: 'ON AIR:',
        series: 'Icecast / Liquidsoap',
        title: 'BLACKMESA Hz',
        description:
            'Transmissão ao vivo e programação autoral via Icecast + Liquidsoap, com fallback para arquivos gravados quando não houver entrada live.',
        host: 'BLACKMESA residents'
    },
    liveTrack: {
        title: 'BLACKMESA Hz ao vivo',
        artist: 'Icecast / Liquidsoap',
        src: configuredStreamUrl,
        artwork: '/capa_quinzenal.png',
        genre: 'Live stream',
        release: 'BLACKMESA Hz'
    } satisfies RadioTrack,
    tracks: [
        {
            title: 'Aperta o da Forte',
            artist: 'BLACKMESA',
            src: '/radio/audio/aperta-o-da-forte.mp3',
            artwork: '/capa_quinzenal.png',
            genre: 'Autoral',
            release: 'BLACKMESA Hz'
        }
    ] satisfies RadioTrack[],
    tags: ['Ao vivo', 'Autoral', 'Icecast', 'Liquidsoap', 'UK Bass', 'Dubstep', 'Garage', 'São Paulo'],
    next: [
        { time: '20:00', title: 'BLACKMESA LABS', subtitle: 'Residents session / UK pressure' },
        { time: '22:00', title: 'CONCRETICIDADE', subtitle: 'SNOT selection / dubstep' },
        { time: '00:00', title: 'AFTER HOURS', subtitle: 'Arquivos, baixos e ruído' }
    ],
    highlights: [
        {
            date: '29 Jun 2026',
            title: 'SNOT - CONCRETICIDADE',
            description:
                'A primeira edição da série BLACKMESA Hz vira transmissão comentada, atravessando peso, textura e dubstep.',
            host: 'SNOT',
            time_slot: '20:00 - 22:00',
            genre: 'Dubstep',
            image: 'https://placehold.co/128x128/3f4738/eff6ee?text=SNOT'
        },
        {
            date: 'Em breve',
            title: 'LABS TRANSMISSION',
            description:
                'Sets registrados no laboratório BLACKMESA, com convidados e recortes do circuito bass brasileiro.',
            host: 'BM Residents',
            time_slot: '18:00 - 20:00',
            genre: 'UK Bass / Grime',
            image: 'https://placehold.co/128x128/3f4738/eff6ee?text=LABS'
        },
        {
            date: 'Arquivo',
            title: 'BOOTLEGS I RADIO',
            description: 'Escuta expandida do catálogo BM001 com notas, versões e contexto de produção.',
            host: 'Black Mesa',
            time_slot: '22:00 - 00:00',
            genre: 'Bootlegs / Garage',
            image: 'https://placehold.co/128x128/3f4738/eff6ee?text=BOOTS'
        }
    ],
    scheduleDays: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'],
    schedule: [
        { time: '18', shows: ['', '', 'Rec: Hz', '', 'Warmup', 'Arquivo', ''] },
        { time: '20', shows: ['Labs', '', 'Concreticidade', '', 'Residents', 'Guest Mix', 'Sunday Bass'] },
        { time: '22', shows: ['Rec: BM001', 'Garage Notes', '', 'Grime Files', 'Club Pressure', 'Live Room', ''] },
        { time: '00', shows: ['', 'After Hours', '', 'Dub Pressure', 'After Hours', 'After Hours', 'Rec: Labs'] }
    ]
};
