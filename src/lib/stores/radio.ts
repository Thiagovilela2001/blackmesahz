import { writable } from 'svelte/store';

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

export const isPlaying = writable(false);
export const radioStatus = writable('Carregando player Spotify.');
export const nowPlaying = writable({
    artist: '',
    track: '',
    artwork_url: ''
});

let spotifyController: SpotifyEmbedController | null = null;

export function setSpotifyController(controller: SpotifyEmbedController) {
    spotifyController = controller;
    radioStatus.set('BLACKMESA Hz pronta no Spotify.');

    controller.addListener('ready', () => {
        radioStatus.set('BLACKMESA Hz pronta no Spotify.');
    });

    controller.addListener('playback_started', () => {
        isPlaying.set(true);
        radioStatus.set('Tocando BLACKMESA Hz.');
    });

    controller.addListener('playback_update', (event) => {
        const playback = event.data;
        if (!playback) return;

        const playing = !playback.isPaused && !playback.isBuffering;
        isPlaying.set(playing);

        if (playback.isBuffering) {
            radioStatus.set('Carregando faixa no Spotify.');
        } else if (playback.isPaused) {
            radioStatus.set('Spotify pausado.');
        } else {
            radioStatus.set('Tocando BLACKMESA Hz.');
        }
    });
}

export function destroySpotifyController() {
    spotifyController?.destroy?.();
    spotifyController = null;
    isPlaying.set(false);
    radioStatus.set('Player Spotify desconectado.');
}

export function toggleRadio() {
    if (!spotifyController) {
        radioStatus.set('Player Spotify ainda esta carregando.');
        return;
    }

    spotifyController.togglePlay();
}

export function setAudioElement() {
    // Kept for compatibility with older components that used a local audio stream.
}

export async function fetchNowPlaying() {
    // The Spotify Embed API does not expose track metadata for playlist embeds.
}
