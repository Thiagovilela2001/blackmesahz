<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { currentTab } from '$lib/stores/navigation';
    import { currentIndex, expandedCardIndex, isAnimating, isPlaylistArticleOpen } from '$lib/stores/cards';
    import ImageLightbox from '$lib/components/ImageLightbox.svelte';
    import SubHeader from '$lib/components/SubHeader.svelte';

    let { data } = $props();
    let Content = $derived(data.content);
    let soundcloudEmbedUrl = $derived(
        data.meta.soundcloudUrl
            ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(data.meta.soundcloudUrl)}&color=%23779383&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
            : ''
    );
    let lightbox: ImageLightbox;

    function resetCardState() {
        currentIndex.set(0);
        expandedCardIndex.set(null);
        isAnimating.set(false);
        isPlaylistArticleOpen.set(false);
    }

    function goBack() {
        resetCardState();
        currentTab.set('playlists');
        goto('/');
    }

    function goHome() {
        resetCardState();
        currentTab.set('home');
        goto('/');
    }

    function openLightbox(src: string, alt: string) {
        if (lightbox) lightbox.openLightbox(src, alt);
    }

    onMount(() => {
        currentTab.set('playlists');
    });
</script>

<svelte:head>
    <title>{data.meta.title} - BLACKMESA</title>
</svelte:head>

<!-- Sub Header for navigation context -->
<SubHeader />

<!-- Lightbox -->
<ImageLightbox bind:this={lightbox} />

<div id="playlist-wrapper" style="display: block" role="presentation" tabindex="-1" onclick={goBack}>
    <article class="playlist-publication" role="presentation" onclick={(event) => event.stopPropagation()}>
        <header class="playlist-publication-header">
            <div class="playlist-publication-brand">
                <strong>{data.meta.publication}</strong>
                <span>{data.meta.issue}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="button" class="playlist-close-btn" onclick={goBack}>Voltar (Artigos)</button>
                <button type="button" class="playlist-close-btn" onclick={goHome}>Início</button>
            </div>
        </header>

        <div class="playlist-article">
            <span class="playlist-article-kicker">{data.meta.publication}</span>
            <h1 class="playlist-article-title">{data.meta.title}</h1>
            <p class="playlist-article-subtitle">{data.meta.subtitle}</p>
            <div class="playlist-article-meta">
                {#each [data.meta.author, data.meta.date, data.meta.genre].filter(Boolean) as item, idx}
                    {#if idx > 0}<span aria-hidden="true">/</span>{/if}
                    <span>{item}</span>
                {/each}
            </div>

            {#if data.meta.heroImage}
                <figure class="playlist-hero-image">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img
                        src={data.meta.heroImage}
                        alt={data.meta.heroAlt || 'Hero Image'}
                        onclick={() => openLightbox(data.meta.heroImage, data.meta.heroAlt || '')}
                    >
                    {#if data.meta.heroAlt}
                        <figcaption class="playlist-image-caption">{data.meta.heroAlt}</figcaption>
                    {/if}
                </figure>
            {/if}

            {#if data.meta.soundcloudUrl}
                <section class="playlist-soundcloud-player" aria-label="Player SoundCloud">
                    <div class="playlist-soundcloud-header">
                        <span>Escute aqui</span>
                        <a href={data.meta.soundcloudUrl} target="_blank" rel="noreferrer">
                            Abrir no SoundCloud
                            <i class="fa-brands fa-soundcloud"></i>
                        </a>
                    </div>
                    <iframe
                        title={`${data.meta.title} no SoundCloud`}
                        width="100%"
                        height="360"
                        scrolling="no"
                        frameborder="no"
                        allow="autoplay; encrypted-media"
                        src={soundcloudEmbedUrl}
                    ></iframe>
                </section>
            {/if}

            <div class="playlist-article-body">
                <Content />
            </div>

            {#if data.meta.gallery?.length}
                <div class="playlist-image-grid">
                    {#each data.meta.gallery as image}
                        <figure>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <img
                                src={image.src}
                                alt={image.alt}
                                loading="lazy"
                                onclick={() => openLightbox(image.src, image.alt)}
                            >
                            <figcaption class="playlist-image-caption">{image.alt}</figcaption>
                        </figure>
                    {/each}
                </div>
            {/if}

            {#if data.meta.credits?.length}
                <footer class="playlist-article-footer">
                    <strong>Créditos</strong>
                    {#each data.meta.credits as credit}
                        {credit}<br>
                    {/each}
                </footer>
            {/if}
        </div>
    </article>
</div>

<style>
    .playlist-soundcloud-player {
        margin: 28px 0 8px;
        border: 1px solid rgba(0, 0, 0, 0.18);
        background: #111111;
        color: #ffffff;
    }

    .playlist-soundcloud-header {
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }

    .playlist-soundcloud-header span,
    .playlist-soundcloud-header a {
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .playlist-soundcloud-header span {
        color: var(--accent-color);
    }

    .playlist-soundcloud-header a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        text-decoration: none;
    }

    .playlist-soundcloud-header a:hover,
    .playlist-soundcloud-header a:focus-visible {
        color: var(--accent-color);
    }

    .playlist-soundcloud-player iframe {
        display: block;
        border: 0;
    }

    @media (max-width: 640px) {
        .playlist-soundcloud-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 12px;
        }

        .playlist-soundcloud-player iframe {
            height: 300px;
        }
    }
</style>
