<script lang="ts">
    import { onMount } from 'svelte';
    import { blackmesaHzPlaylist } from '$lib/data/blackmesaHz';
    import {
        destroySpotifyController,
        isPlaying,
        nowPlaying,
        radioStatus,
        setSpotifyController,
        toggleRadio,
        type SpotifyEmbedController
    } from '$lib/stores/radio';

    type SpotifyIFrameApi = {
        createController: (
            element: HTMLElement,
            options: { height: number; theme: string; uri: string; width: string },
            callback: (controller: SpotifyEmbedController) => void
        ) => void;
    };

    type SpotifyWindow = Window &
        typeof globalThis & {
            SpotifyIframeApi?: SpotifyIFrameApi;
            onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
        };

    const apiScriptSrc = 'https://open.spotify.com/embed/iframe-api/v1';
    const barsCount = 12;

    let spotifyMount: HTMLDivElement;

    function createSpotifyController(api: SpotifyIFrameApi) {
        if (!spotifyMount) return;

        api.createController(
            spotifyMount,
            {
                height: 80,
                theme: 'dark',
                uri: blackmesaHzPlaylist.spotifyUri,
                width: '100%'
            },
            (controller) => {
                setSpotifyController(controller);
            }
        );
    }

    function loadSpotifyApi() {
        const spotifyWindow = window as SpotifyWindow;

        if (spotifyWindow.SpotifyIframeApi) {
            createSpotifyController(spotifyWindow.SpotifyIframeApi);
            return;
        }

        const previousReady = spotifyWindow.onSpotifyIframeApiReady;
        spotifyWindow.onSpotifyIframeApiReady = (api: SpotifyIFrameApi) => {
            spotifyWindow.SpotifyIframeApi = api;
            previousReady?.(api);
            createSpotifyController(api);
        };

        if (!document.querySelector(`script[src="${apiScriptSrc}"]`)) {
            const script = document.createElement('script');
            script.src = apiScriptSrc;
            script.async = true;
            document.body.appendChild(script);
        }
    }

    onMount(() => {
        loadSpotifyApi();

        return () => {
            destroySpotifyController();
        };
    });
</script>

<div class="spotify-controller-host" aria-hidden="true">
    <div bind:this={spotifyMount}></div>
</div>

<div class="radio-mini-player">
    <button
        class="radio-mini-play-btn"
        class:is-playing={$isPlaying}
        onclick={toggleRadio}
        aria-label={$isPlaying ? 'Pausar Spotify' : 'Tocar Spotify'}
    >
        <i class={$isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
    </button>

    <div class="radio-mini-info">
        <span class="radio-mini-station">{blackmesaHzPlaylist.title}</span>
        <span class="radio-mini-track">
            {$nowPlaying.artist ? `${$nowPlaying.artist} - ${$nowPlaying.track}` : $radioStatus}
        </span>
    </div>

    <div class="radio-mini-waveform" class:is-playing={$isPlaying} aria-hidden="true">
        {#each Array(barsCount) as _}
            <span></span>
        {/each}
    </div>
</div>

<style>
    .spotify-controller-host {
        position: fixed;
        left: -9999px;
        bottom: 0;
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
    }
</style>
