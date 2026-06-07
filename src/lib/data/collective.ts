export type CollectiveRole = 'djs' | 'producers' | 'mcs' | 'photo-video' | 'programming';
export type CollectiveFilter = CollectiveRole | 'all';

export type CollectiveMember = {
    handle: string;
    name: string;
    soundcloudUrl: string;
    roles: CollectiveRole[];
};

export const roleLabels: Record<CollectiveRole, string> = {
    djs: 'DJs',
    producers: 'Produtores',
    mcs: 'MCs',
    'photo-video': 'Foto/Video',
    programming: 'Programacao'
};

export const roleFilters: { id: CollectiveFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'djs', label: 'DJs' },
    { id: 'producers', label: 'Produtores' },
    { id: 'mcs', label: 'MCs' },
    { id: 'photo-video', label: 'Foto/Video' },
    { id: 'programming', label: 'Programacao' }
];

export const collectiveMembers: CollectiveMember[] = [
    {
        handle: 'nvnsx',
        name: 'NVNSX',
        soundcloudUrl: 'https://soundcloud.com/nvnsx',
        roles: ['djs']
    },
    {
        handle: 'jefjefbeats',
        name: 'Djefjef',
        soundcloudUrl: 'https://soundcloud.com/jefjefbeats',
        roles: ['djs', 'producers']
    },
    {
        handle: 'drauziovilela',
        name: 'Drauzio Vilela',
        soundcloudUrl: 'https://soundcloud.com/drauziovilela',
        roles: ['djs', 'producers', 'programming']
    },
    {
        handle: 'matesu',
        name: 'Matesu',
        soundcloudUrl: 'https://soundcloud.com/matesu',
        roles: ['djs', 'producers', 'programming']
    },
    {
        handle: 'djgordon-96654309',
        name: 'Gordon',
        soundcloudUrl: 'https://soundcloud.com/djgordon-96654309',
        roles: ['djs', 'producers', 'photo-video', 'mcs']
    },
    {
        handle: 'paulinho-jarilho',
        name: 'Jarilho',
        soundcloudUrl: 'https://soundcloud.com/paulinho-jarilho',
        roles: ['djs', 'photo-video']
    },
    {
        handle: 'olbiv',
        name: 'Roxas',
        soundcloudUrl: 'https://soundcloud.com/olbiv',
        roles: ['djs', 'producers']
    },
    {
        handle: 'executeee',
        name: 'Execute',
        soundcloudUrl: 'https://soundcloud.com/executeee',
        roles: ['djs', 'producers']
    },
    {
        handle: 'kashinthesujo',
        name: 'Kashin',
        soundcloudUrl: 'https://soundcloud.com/kashinthesujo',
        roles: ['djs', 'producers']
    },
    {
        handle: 'snot140bpm',
        name: 'SNOT',
        soundcloudUrl: 'https://soundcloud.com/snot140bpm',
        roles: ['djs', 'producers']
    },
    {
        handle: 'deveras-rec',
        name: 'Kokas',
        soundcloudUrl: 'https://soundcloud.com/deveras-rec',
        roles: ['djs', 'producers', 'mcs']
    },
    {
        handle: 'samufromleste',
        name: 'Samu',
        soundcloudUrl: 'https://soundcloud.com/samufromleste',
        roles: ['mcs']
    }
];
