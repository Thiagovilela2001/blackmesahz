import { get, writable } from 'svelte/store';
import { radioData as fallbackRadioData, type RadioData, type RadioTrack } from '$lib/data/radio';

type SpotifyPlaybackUpdate = {
    data?: {
        isPaused?: boolean;
        isBuffering?: boolean;
        playingURI?: string;
    };
};

export type SpotifyEmbedController = {
    addListener: (event: string, callback: (event: SpotifyPlaybackUpdate) => void) => void;
    destroy?: () => void;
    pause: () => void;
    resume: () => void;
    togglePlay: () => void;
};

let radioCatalog: RadioData = fallbackRadioData;

export const radioTracks = writable<RadioTrack[]>(radioCatalog.tracks);
export const currentTrackIndex = writable(0);
export const activeRadioSource = writable<'live' | 'archive'>(radioCatalog.mode === 'live' ? 'live' : 'archive');
export const isPlaying = writable(false);
export const radioStatus = writable('BLACKMESA Hz pronta.');
export const nowPlaying = writable({
    artist: radioCatalog.liveTrack.artist,
    track: radioCatalog.liveTrack.title,
    artwork_url: radioCatalog.liveTrack.artwork ?? ''
});

let audioElement: HTMLAudioElement | null = null;
let spotifyController: SpotifyEmbedController | null = null;

function syncNowPlaying(track: RadioTrack | undefined) {
    nowPlaying.set({
        artist: track?.artist ?? '',
        track: track?.title ?? '',
        artwork_url: track?.artwork ?? ''
    });
}

function currentTrack() {
    if (get(activeRadioSource) === 'live') {
        return radioCatalog.liveTrack;
    }

    return get(radioTracks)[get(currentTrackIndex)];
}

export function setRadioCatalog(nextCatalog: RadioData) {
    radioCatalog = nextCatalog;
    radioTracks.set(nextCatalog.tracks);
    activeRadioSource.set(nextCatalog.mode === 'live' ? 'live' : 'archive');
    currentTrackIndex.set(0);
    syncNowPlaying(currentTrack());
}

function loadTrack(track: RadioTrack | undefined) {
    if (!audioElement || !track) return;

    if (audioElement.src !== new URL(track.src, window.location.href).href) {
        audioElement.src = track.src;
        audioElement.load();
    }

    syncNowPlaying(track);
}

async function playCurrentTrack() {
    if (!audioElement) {
        radioStatus.set('Player da rádio ainda está carregando.');
        return;
    }

    const track = currentTrack();
    if (!track?.src) {
        radioStatus.set('Configure PUBLIC_RADIO_STREAM_URL ou adicione uma faixa em static/radio/audio.');
        return;
    }

    loadTrack(track);

    try {
        await audioElement.play();
        isPlaying.set(true);
        radioStatus.set(get(activeRadioSource) === 'live' ? 'Transmitindo BLACKMESA Hz ao vivo.' : `Tocando ${track.title}.`);
    } catch {
        isPlaying.set(false);
        radioStatus.set(`Não foi possível tocar ${track.src}. Confira se o stream ou arquivo está disponível.`);
    }
}

export function setAudioElement(element: HTMLAudioElement) {
    audioElement = element;
    audioElement.preload = 'none';
    loadTrack(currentTrack());

    audioElement.addEventListener('play', () => {
        isPlaying.set(true);
        const track = currentTrack();
        radioStatus.set(get(activeRadioSource) === 'live' ? 'Transmitindo BLACKMESA Hz ao vivo.' : `Tocando ${track?.title ?? 'BLACKMESA Hz'}.`);
    });

    audioElement.addEventListener('pause', () => {
        isPlaying.set(false);
        radioStatus.set('Rádio pausada.');
    });

    audioElement.addEventListener('ended', () => {
        if (get(activeRadioSource) === 'live') return;
        playNextTrack();
    });

    audioElement.addEventListener('error', () => {
        const track = currentTrack();
        isPlaying.set(false);
        radioStatus.set(
            track
                ? `Stream/arquivo indisponível: ${track.src}`
                : 'Stream ou arquivo de áudio indisponível.'
        );
    });
}

export function toggleRadio() {
    if (get(isPlaying)) {
        audioElement?.pause();
        return;
    }

    void playCurrentTrack();
}

export function playLiveStream() {
    activeRadioSource.set('live');
    loadTrack(radioCatalog.liveTrack);
    void playCurrentTrack();
}

export function playTrack(index: number) {
    const tracks = get(radioTracks);
    if (!tracks[index]) return;

    activeRadioSource.set('archive');
    currentTrackIndex.set(index);
    loadTrack(tracks[index]);
    void playCurrentTrack();
}

export function playNextTrack() {
    const tracks = get(radioTracks);
    if (!tracks.length) return;

    const nextIndex = (get(currentTrackIndex) + 1) % tracks.length;
    playTrack(nextIndex);
}

export function playPreviousTrack() {
    const tracks = get(radioTracks);
    if (!tracks.length) return;

    const previousIndex = (get(currentTrackIndex) - 1 + tracks.length) % tracks.length;
    playTrack(previousIndex);
}

export function setSpotifyController(controller: SpotifyEmbedController) {
    spotifyController = controller;
}

export function destroySpotifyController() {
    spotifyController?.destroy?.();
    spotifyController = null;
}

export async function fetchNowPlaying() {
    syncNowPlaying(currentTrack());
}
