export const radioData = {
    streamUrl: '',
    station: 'BLACKMESA Hz',
    location: 'São Paulo / Online',
    currentShow: {
        label: 'LIVE:',
        series: 'Transmissão Piloto',
        title: 'BLACKMESA Hz',
        description: 'Canal online para sets, residências, conversas e transmissões especiais orbitando UK Bass, dubstep, grime, garage e experimentações de pista.',
        host: 'BLACKMESA residents'
    },
    tags: ['UK Bass', 'Dubstep', 'Grime', 'Garage', 'Breaks', 'São Paulo', 'Live Sets', 'Residência'],
    next: [
        { time: '20:00', title: 'BLACKMESA LABS', subtitle: 'Residents session / UK pressure' },
        { time: '22:00', title: 'CONCRETICIDADE', subtitle: 'SNOT selection / dubstep' },
        { time: '00:00', title: 'AFTER HOURS', subtitle: 'Arquivos, baixos e ruído' }
    ],
    highlights: [
        {
            date: '29 Jun 2026',
            title: 'SNOT - CONCRETICIDADE',
            description: 'A primeira edição da série BLACKMESA Hz vira transmissão comentada, atravessando peso, textura e dubstep.',
            host: 'SNOT',
            time_slot: '20:00 - 22:00',
            genre: 'Dubstep',
            image: 'https://placehold.co/128x128/3f4738/eff6ee?text=SNOT'
        },
        {
            date: 'Em breve',
            title: 'LABS TRANSMISSION',
            description: 'Sets registrados no laboratório BLACKMESA, com convidados e recortes do circuito bass brasileiro.',
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
