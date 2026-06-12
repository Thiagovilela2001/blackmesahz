<script lang="ts">
    import './layout.css';
    import Header from '$lib/components/Header.svelte';
    import LoadingScreen from '$lib/components/LoadingScreen.svelte';
    import CookieBanner from '$lib/components/CookieBanner.svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
    import { theme } from '$lib/stores/navigation';
    import { onMount } from 'svelte';

    let { children } = $props();

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

<CookieBanner />
