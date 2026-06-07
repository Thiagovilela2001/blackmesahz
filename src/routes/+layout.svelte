<script lang="ts">
    import './layout.css';
    import RadioPlayer from '$lib/components/RadioPlayer.svelte';
    import Header from '$lib/components/Header.svelte';
    import LoadingScreen from '$lib/components/LoadingScreen.svelte';
    import CookieBanner from '$lib/components/CookieBanner.svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
    import { theme } from '$lib/stores/navigation';
    import { onMount } from 'svelte';

    let { children } = $props();

    // Custom cursor
    let cursorX = $state(-100);
    let cursorY = $state(-100);
    let cursorAngle = $state(-45);
    let cursorHovering = $state(false);
    let cursorClicking = $state(false);
    let prevMX = 0, prevMY = 0;
    let idleTimer: ReturnType<typeof setTimeout>;

    $effect(() => {
        const onMove = (e: MouseEvent) => {
            const dx = e.clientX - prevMX;
            const dy = e.clientY - prevMY;
            prevMX = e.clientX;
            prevMY = e.clientY;
            cursorX = e.clientX;
            cursorY = e.clientY;

            const speed = Math.sqrt(dx * dx + dy * dy);
            if (speed > 3) {
                const tilt = Math.atan2(dy, dx) * (180 / Math.PI) * 0.2;
                cursorAngle = -45 + Math.max(-20, Math.min(20, tilt));
                clearTimeout(idleTimer);
                idleTimer = setTimeout(() => { cursorAngle = -45; }, 400);
            }

            const target = e.target as Element;
            cursorHovering = !!target?.closest('a, button, [role="button"], input, select, label');
        };

        const onDown = () => { cursorClicking = true; };
        const onUp   = () => { cursorClicking = false; };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        return () => {
            clearTimeout(idleTimer);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
        };
    });

    onMount(() => {
        const cookies = document.cookie.split(';');
        const themeCookie = cookies.find(c => c.trim().startsWith('site_theme='));
        if (themeCookie) {
            theme.set(themeCookie.split('=')[1] as 'default' | 'theme-04');
        }
    });

    $effect(() => {
        if (typeof document !== 'undefined') {
            document.body.className = $theme;
        }
    });
</script>

<svelte:head>
    <title>BLACKMESA</title>
</svelte:head>

<LoadingScreen />

<Header />

{#key $page.url.pathname}
    <div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }} style="display: contents;">
        {@render children()}
    </div>
{/key}

<RadioPlayer />
<CookieBanner />

<!-- Custom Cursor -->
<div
    class="cursor-pos"
    style="transform: translate({cursorX}px, {cursorY}px)"
    aria-hidden="true"
>
    <div class="cursor-rot" style="transform: rotate({cursorAngle}deg)">
        <img
            src="/crowbar.png"
            alt=""
            class:hovering={cursorHovering}
            class:clicking={cursorClicking}
        />
    </div>
</div>

<style>
    .cursor-pos {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999999;
        will-change: transform;
    }

    .cursor-rot {
        transform-origin: 4px 4px;
        margin: -4px 0 0 -4px;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cursor-rot img {
        width: 48px;
        height: 48px;
        display: block;
        filter: drop-shadow(0 0 3px rgba(119, 147, 131, 0.5));
        transition: filter 0.2s ease, transform 0.15s ease;
    }

    .cursor-rot img.hovering {
        filter: drop-shadow(0 0 6px #779383) drop-shadow(0 0 14px rgba(119, 147, 131, 0.5));
        transform: scale(1.1);
    }

    .cursor-rot img.clicking {
        filter: drop-shadow(0 0 10px #779383) drop-shadow(0 0 22px rgba(119, 147, 131, 0.8));
        transform: scale(0.82) rotate(-20deg);
        transition: filter 0.05s ease, transform 0.05s ease;
    }
</style>
